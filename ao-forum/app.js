// AO-Forum: A Bitcointalk-style forum on AO
// app.js: The client-side logic for the forum application.

// --- Configuration ---
// In a real app, this would be the actual Process ID on AO.
const PROCESS_ID = "YOUR_PROCESS_ID_HERE";

// --- Mock AO Connect ---
// This is a placeholder to simulate ao.connect(). In a real app, you would
// import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
const ao = {
    // A mock signer using the browser's crypto API for demonstration.
    // In a real app, you'd connect to a wallet like ArConnect.
    createDataItemSigner: window.arweaveWallet ? window.arweaveWallet.sign : (data) => {
        console.warn("Using mock signer. Please connect a real Arweave wallet.");
        return data; // No-op for demo
    },

    // Simulates sending a message to an AO process
    message: async ({ process, action, tags = [], data = "" }) => {
        console.log("Simulating message:", { process, action, tags, data });
        // This is where you would make the actual API call to an AO gateway.
        // For this demo, we'll return a mock success message.
        const msgId = "mock-message-id-" + Math.random();
        return msgId;
    },

    // A better way to read state: use a dryrun request.
    dryrun: async ({ process, action, tags = [], data = "" }) => {
        console.log("Simulating dryrun:", { process, action, tags, data });
        // This would make a POST request to a gateway's /dryrun endpoint.
        // We can't do that here, so we return hardcoded mock data.
        // This is the main limitation of this simulation.

        // This is a very simplified mock. A real implementation would need
        // a backend or a more complex simulation to reflect the Lua state.
        if (action === "GetCategories") {
            return { Messages: [{ Data: JSON.stringify([
                { slug: 'general', name: 'General Discussion', description: 'Talk about anything.' },
                { slug: 'tech', name: 'Technology', description: 'All things tech.' }
            ])}]};
        }
        if (action === "GetThreadsByCategory") {
             return { Messages: [{ Data: JSON.stringify({
                threads: [
                    { id: 'thread-1', title: 'Welcome to the Forum!', creator: 'owner-address', lastPostAt: Date.now() }
                ],
                page: 1,
                totalPages: 1
            })}]};
        }
        if (action === "GetPostsByThread") {
             return { Messages: [{ Data: JSON.stringify({
                posts: [
                    { id: 'post-1', author: 'owner-address', content: 'This is the first post.', createdAt: Date.now() },
                    { id: 'post-2', author: 'user-address', content: 'This is a reply.', createdAt: Date.now() + 1000 }
                ],
                page: 1,
                totalPages: 1
            })}]};
        }

        return { Messages: [{ Data: "[]" }] };
    }
};

// --- App State & Router ---
const state = {
    view: 'categories', // 'categories', 'threads', 'posts'
    currentCategory: null,
    currentThread: null,
    currentPage: 1,
};

function handleRouteChange() {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');

    if (parts[0] === 'category' && parts[1]) {
        state.view = 'threads';
        state.currentCategory = parts[1];
        state.currentPage = parts[2] ? parseInt(parts[2]) : 1;
        renderThreads(state.currentCategory, state.currentPage);
    } else if (parts[0] === 'thread' && parts[1]) {
        state.view = 'posts';
        // We need to know the category to go back, so we need a better state management or router.
        // For now, we assume we can guess it or it was set previously.
        state.currentThread = parts[1];
        state.currentPage = parts[2] ? parseInt(parts[2]) : 1;
        renderPosts(state.currentThread, state.currentPage);
    } else {
        state.view = 'categories';
        renderCategories();
    }
}

// --- Rendering Logic ---
const appRoot = document.getElementById('app-root');

async function renderCategories() {
    try {
        const result = await ao.dryrun({
            process: PROCESS_ID,
            action: 'GetCategories',
        });
        const categories = JSON.parse(result.Messages[0].Data);

        let html = '<h2>Categories</h2><ul class="category-list">';
        categories.forEach(cat => {
            html += `
                <li class="category-item">
                    <h3><a href="#category/${cat.slug}">${cat.name}</a></h3>
                    <p>${cat.description}</p>
                </li>
            `;
        });
        html += '</ul>';
        appRoot.innerHTML = html;
    } catch (error) {
        console.error("Failed to render categories:", error);
        appRoot.innerHTML = '<p>Error loading categories.</p>';
    }
}

async function renderThreads(categorySlug, page = 1) {
    try {
        const result = await ao.dryrun({
            process: PROCESS_ID,
            action: 'GetThreadsByCategory',
            tags: [
                { name: 'CategorySlug', value: categorySlug },
                { name: 'Page', value: String(page) }
            ]
        });
        const { threads, totalPages } = JSON.parse(result.Messages[0].Data);

        let html = `
            <h2>Threads in '${categorySlug}'</h2>
            <a href="#">&larr; Back to Categories</a>
            <ul class="thread-list">
        `;
        threads.forEach(thread => {
            html += `
                <li class="thread-item">
                    <h3><a href="#thread/${thread.id}">${thread.title}</a></h3>
                    <p class="post-meta">By ${thread.creator} &bull; Last post: ${new Date(thread.lastPostAt).toLocaleString()}</p>
                </li>
            `;
        });
        html += '</ul>';

        // Add new thread form
        html += `
            <div class="form-container">
                <h3>Create New Thread</h3>
                <form id="new-thread-form">
                    <input type="text" id="thread-title" placeholder="Thread Title" required>
                    <textarea id="thread-content" placeholder="Your post content..." required></textarea>
                    <button type="submit">Create Thread</button>
                </form>
            </div>
        `;

        appRoot.innerHTML = html;
        document.getElementById('new-thread-form').addEventListener('submit', handleNewThreadSubmit);

    } catch (error) {
        console.error("Failed to render threads:", error);
        appRoot.innerHTML = '<p>Error loading threads.</p>';
    }
}

async function renderPosts(threadId, page = 1) {
    try {
        const result = await ao.dryrun({
            process: PROCESS_ID,
            action: 'GetPostsByThread',
            tags: [
                { name: 'ThreadID', value: threadId },
                { name: 'Page', value: String(page) }
            ]
        });
        const { posts, totalPages } = JSON.parse(result.Messages[0].Data);

        let html = `
            <a href="#category/${state.currentCategory}">&larr; Back to Threads</a>
            <ul class="post-list">
        `;
        posts.forEach(post => {
            html += `
                <li class="post-item">
                    <div class="post-meta">
                        <span class="post-author">${post.author}</span> wrote on
                        <span>${new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <div class="post-content">${marked.parse(post.content)}</div>
                </li>
            `;
        });
        html += '</ul>';

        // Add reply form
        html += `
            <div class="form-container">
                <h3>Post a Reply</h3>
                <form id="new-post-form">
                    <textarea id="post-content" placeholder="Your reply..." required></textarea>
                    <button type="submit">Post Reply</button>
                </form>
            </div>
        `;

        appRoot.innerHTML = html;
        document.getElementById('new-post-form').addEventListener('submit', handleNewPostSubmit);

    } catch (error) {
        console.error("Failed to render posts:", error);
        appRoot.innerHTML = '<p>Error loading posts.</p>';
    }
}


// --- Event Handlers for Forms ---

async function handleNewThreadSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('thread-title').value;
    const content = document.getElementById('thread-content').value;

    if (!title || !content) {
        alert('Title and content are required.');
        return;
    }

    try {
        const messageId = await ao.message({
            process: PROCESS_ID,
            action: 'CreateThread',
            tags: [
                { name: 'CategorySlug', value: state.currentCategory },
                { name: 'Title', value: title }
            ],
            data: content,
            signer: ao.createDataItemSigner(window.arweaveWallet)
        });

        alert(`Thread creation message sent: ${messageId}. It may take a moment to process.`);
        // In a real app, you might poll for the result and then refresh.
        // For now, we'll just reload the view after a short delay.
        setTimeout(() => renderThreads(state.currentCategory), 2000);
    } catch (error) {
        console.error('Failed to create thread:', error);
        alert('Error creating thread.');
    }
}

async function handleNewPostSubmit(e) {
    e.preventDefault();
    const content = document.getElementById('post-content').value;

    if (!content) {
        alert('Content is required.');
        return;
    }

    try {
        const messageId = await ao.message({
            process: PROCESS_ID,
            action: 'CreatePost',
            tags: [{ name: 'ThreadID', value: state.currentThread }],
            data: content,
            signer: ao.createDataItemSigner(window.arweaveWallet)
        });

        alert(`Reply message sent: ${messageId}. It may take a moment to process.`);
        setTimeout(() => renderPosts(state.currentThread), 2000);
    } catch (error) {
        console.error('Failed to create post:', error);
        alert('Error creating post.');
    }
}

// --- Initialization ---
function init() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange(); // Render initial view
}

document.addEventListener('DOMContentLoaded', init);