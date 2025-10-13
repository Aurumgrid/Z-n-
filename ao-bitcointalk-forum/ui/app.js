document.addEventListener('alpine:init', () => {
    Alpine.data('forum', () => ({
        // --- STATE ---
        wallet: { address: null, isModerator: false },
        view: 'threads', // 'threads', 'posts', 'newThread'
        categories: [],
        threads: [],
        posts: [],
        currentCategory: null,
        currentThread: null,
        newCategoryName: '',
        newThreadTitle: '',
        newPostContent: '',
        isLoading: false,
        status: 'Initializing...',

        // --- CONSTANTS ---
        AO_PROCESS_ID: "YOUR_PROCESS_ID_HERE", // User must replace this

        // --- METHODS ---

        // Initialize the component
        async init() {
            this.status = 'Connecting to wallet...';
            await this.connectWallet(true); // silent connect
            this.status = 'Fetching categories...';
            await this.fetchCategories();
            if (this.categories.length > 0) {
                await this.selectCategory(this.categories[0].Slug);
            } else {
                this.status = 'No categories found. Create one!';
                this.isLoading = false;
            }
            this.listenForNewPosts();
        },

        // Connect to ArConnect wallet
        async connectWallet(silent = false) {
            if (window.arweaveWallet) {
                try {
                    if (!silent) {
                        await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
                    }
                    const addr = await window.arweaveWallet.getActiveAddress();
                    if (addr) {
                        this.wallet.address = addr;
                        await this.checkModeratorStatus();
                    }
                } catch (e) {
                    if (!silent) alert('Could not connect to wallet. See console for details.');
                    console.error("Wallet connection failed", e);
                }
            } else {
                if (!silent) alert('ArConnect not found. Please install it.');
            }
        },

        // Check if the connected user is a moderator
        async checkModeratorStatus() {
            if (!this.wallet.address) return;
            const res = await this.dryrun({
                Owner: this.wallet.address,
                tags: [{ name: 'Action', value: 'IsModerator' }],
            });
            this.wallet.isModerator = res.Messages[0]?.Data === 'true';
        },

        // Fetch all categories
        async fetchCategories() {
            const res = await this.dryrun({ tags: [{ name: 'Action', value: 'GetCategories' }] });
            if (res.Messages[0]?.Data) {
                this.categories = JSON.parse(res.Messages[0].Data);
            }
        },

        // Select a category and fetch its threads
        async selectCategory(slug) {
            this.isLoading = true;
            this.status = `Fetching threads for ${slug}...`;
            this.currentCategory = slug;
            this.view = 'threads';
            const res = await this.dryrun({
                tags: [{ name: 'Action', value: 'GetThreadsByCategory' }, { name: 'Category', value: slug }],
            });
            this.threads = res.Messages[0]?.Data ? JSON.parse(res.Messages[0].Data) : [];
            this.isLoading = false;
            this.status = '';
        },

        // Select a thread and fetch its posts
        async selectThread(threadId) {
            this.isLoading = true;
            this.status = `Fetching posts...`;
            this.currentThread = this.threads.find(t => t.Id === threadId) || null;
            this.view = 'posts';
            const res = await this.dryrun({
                tags: [{ name: 'Action', value: 'GetPostsByThread' }, { name: 'ThreadId', value: threadId }],
            });
            this.posts = res.Messages[0]?.Data ? JSON.parse(res.Messages[0].Data) : [];
            this.isLoading = false;
            this.status = '';
        },

        // Create a new category (moderator only)
        async createCategory() {
            if (!this.newCategoryName.trim() || !this.wallet.isModerator) return;
            this.status = 'Creating category...';
            await this.send({
                tags: [{ name: 'Action', value: 'CreateCategory' }, { name: 'Name', value: this.newCategoryName }],
            });
            this.newCategoryName = '';
            await this.fetchCategories(); // Refresh list
            this.status = '';
        },

        // Create a new thread and its first post
        async createThread() {
            if (!this.newThreadTitle.trim() || !this.newPostContent.trim()) return;
            this.status = 'Creating thread...';
            await this.send({
                tags: [
                    { name: 'Action', value: 'CreateThread' },
                    { name: 'Category', value: this.currentCategory },
                    { name: 'Title', value: this.newThreadTitle }
                ],
                data: this.newPostContent
            });
            this.newThreadTitle = '';
            this.newPostContent = '';
            this.view = 'threads';
            this.status = 'Thread created. Refreshing...';
            await this.selectCategory(this.currentCategory);
        },

        // Create a new post in the current thread
        async createPost() {
            if (!this.newPostContent.trim()) return;
            this.status = 'Submitting reply...';
            await this.send({
                tags: [{ name: 'Action', value: 'CreatePost' }, { name: 'ThreadId', value: this.currentThread.Id }],
                data: this.newPostContent
            });
            this.newPostContent = '';
            this.status = 'Reply submitted.';
            // Real-time event will handle UI update
        },

        // Like a post
        async likePost(postId) {
            await this.send({
                tags: [{ name: 'Action', value: 'LikePost' }, { name: 'PostId', value: postId }],
            });
            const post = this.posts.find(p => p.Id === postId);
            if (post && !post.liked) {
                post.Likes++;
                post.liked = true; // Prevent multiple likes locally
            }
        },

        // Listen for new posts via Lattica
        listenForNewPosts() {
            if (window.ao && window.ao.monitor) {
                window.ao.monitor({
                    process: this.AO_PROCESS_ID,
                    tags: [{ name: "Action", value: "Lattica-Event" }]
                }).on("event", (event) => {
                    if (event.Name === "post:new") {
                        const newPost = JSON.parse(event.Data);
                        if (this.view === 'posts' && this.currentThread.Id === newPost.ThreadId) {
                            this.posts.unshift(newPost);
                        }
                        const thread = this.threads.find(t => t.Id === newPost.ThreadId);
                        if (thread) {
                            thread.LastPostAt = newPost.CreatedAt;
                            thread.PostCount++;
                            this.threads.sort((a, b) => b.LastPostAt - a.LastPostAt);
                        }
                    }
                });
            } else {
                console.warn("ao.monitor not available. Real-time updates disabled.");
            }
        },

        // --- AO HELPERS ---
        async dryrun(params) {
            if (!window.ao) {
                console.error("AO SDK (`ao`) not found on window object.");
                return { Messages: [] };
            }
            try {
                return await window.ao.dryrun({ process: this.AO_PROCESS_ID, ...params });
            } catch (e) {
                console.error("Dryrun failed:", e);
                return { Messages: [] };
            }
        },

        async send(params) {
            if (!window.arweaveWallet) {
                alert('Please connect your wallet first.');
                return null;
            }
            try {
                const messageId = await window.ao.send({ process: this.AO_PROCESS_ID, ...params });
                return messageId;
            } catch (e) {
                console.error("Send failed:", e);
                alert('An error occurred. See console for details.');
                return null;
            }
        },
    }));
});