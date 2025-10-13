-- ao-bitcointalk-forum: Backend Process
-- This Lua script defines the core logic for a Bitcointalk-style forum on the AO network.
-- It handles data storage, user authentication via signatures, and real-time event emissions.

json = require("json")

-- Globals
Posts = Posts or {}
Threads = Threads or {}
Categories = Categories or {}
Moderators = Moderators or {}
Likes = Likes or {}

-- Index tables for efficient querying
ThreadsByCategory = ThreadsByCategory or {}
PostsByThread = PostsByThread or {}

-- Initialize the set of moderators (can only be updated by the process owner)
if not Moderators[ao.id] then
    Moderators = {
        [ao.id] = true
    }
end

-- Handler for creating a new category
Handlers.add("CreateCategory", Handlers.utils.hasMatchingTag("Action", "CreateCategory"),
    function(msg)
        if not Moderators[msg.Owner] then
            ao.send({ Target = msg.From, Data = "Error: Only moderators can create categories." })
            return
        end

        local name = msg.Tags.Name
        local slug = name:lower():gsub("%s+", "-")

        if Categories[slug] then
            ao.send({ Target = msg.From, Data = "Error: A category with this slug already exists." })
            return
        end

        Categories[slug] = {
            Name = name,
            Slug = slug,
            ThreadCount = 0
        }

        ao.send({ Target = msg.From, Data = "Category created successfully: " .. slug })
    end
)

-- Handler for creating a new thread (and its first post)
Handlers.add("CreateThread", Handlers.utils.hasMatchingTag("Action", "CreateThread"),
    function(msg)
        if not ao.utils.verify(msg.Owner, msg.Id, msg.Signature) then
            ao.send({ Target = msg.From, Data = "Error: Invalid signature." })
            return
        end

        local categorySlug = msg.Tags.Category
        local title = msg.Tags.Title
        local content = msg.Data

        if not Categories[categorySlug] then
            ao.send({ Target = msg.From, Data = "Error: Category not found." })
            return
        end

        -- Create the thread
        local threadId = tostring(math.random(1, 1e12))
        Threads[threadId] = {
            Id = threadId,
            Category = categorySlug,
            Title = title,
            Creator = msg.Owner,
            CreatedAt = msg.Timestamp,
            LastPostAt = msg.Timestamp,
            PostCount = 1 -- A thread starts with one post
        }
        Categories[categorySlug].ThreadCount = Categories[categorySlug].ThreadCount + 1

        -- Add to thread index
        if not ThreadsByCategory[categorySlug] then
            ThreadsByCategory[categorySlug] = {}
        end
        table.insert(ThreadsByCategory[categorySlug], 1, threadId)

        -- Create the first post for the thread
        local postId = tostring(math.random(1, 1e12))
        Posts[postId] = {
            Id = postId,
            ThreadId = threadId,
            Author = msg.Owner,
            Content = content,
            CreatedAt = msg.Timestamp,
            Likes = 0
        }

        -- Add to post index
        if not PostsByThread[threadId] then
            PostsByThread[threadId] = {}
        end
        table.insert(PostsByThread[threadId], 1, postId)

        ao.send({ Target = msg.From, Data = "Thread created successfully: " .. threadId })
    end
)

-- Handler for creating a new post
Handlers.add("CreatePost", Handlers.utils.hasMatchingTag("Action", "CreatePost"),
    function(msg)
        if not ao.utils.verify(msg.Owner, msg.Id, msg.Signature) then
            ao.send({ Target = msg.From, Data = "Error: Invalid signature." })
            return
        end

        local threadId = msg.Tags.ThreadId
        local content = msg.Data

        if not Threads[threadId] then
            ao.send({ Target = msg.From, Data = "Error: Thread not found." })
            return
        end

        local postId = tostring(math.random(1, 1e12))
        Posts[postId] = {
            Id = postId,
            ThreadId = threadId,
            Author = msg.Owner,
            Content = content,
            CreatedAt = msg.Timestamp,
            Likes = 0
        }

        Threads[threadId].PostCount = Threads[threadId].PostCount + 1
        Threads[threadId].LastPostAt = msg.Timestamp

        -- Add to post index
        if not PostsByThread[threadId] then
            PostsByThread[threadId] = {}
        end
        table.insert(PostsByThread[threadId], 1, postId)

        -- Re-sort threads by last post time
        local categorySlug = Threads[threadId].Category
        table.sort(ThreadsByCategory[categorySlug], function(a, b)
            return Threads[a].LastPostAt > Threads[b].LastPostAt
        end)

        -- Emit a Lattica event for real-time updates
        ao.send({
            Target = ao.id,
            Action = "Lattica-Event",
            Name = "post:new",
            Data = json.encode(Posts[postId])
        })

        ao.send({ Target = msg.From, Data = "Post created successfully: " .. postId })
    end
)

-- Handler for liking a post
Handlers.add("LikePost", Handlers.utils.hasMatchingTag("Action", "LikePost"),
    function(msg)
        local postId = msg.Tags.PostId
        if not Posts[postId] then
            ao.send({ Target = msg.From, Data = "Error: Post not found." })
            return
        end

        local userLikesKey = msg.Owner .. ":" .. postId
        if Likes[userLikesKey] then
            ao.send({ Target = msg.From, Data = "Error: You have already liked this post." })
            return
        end

        Likes[userLikesKey] = true
        Posts[postId].Likes = Posts[postId].Likes + 1

        ao.send({ Target = msg.From, Data = "Post liked successfully." })
    end
)

-- Read Handlers --

-- Get all categories
Handlers.add("GetCategories", Handlers.utils.hasMatchingTag("Action", "GetCategories"),
    function(msg)
        local cats = {}
        for _, category in pairs(Categories) do
            table.insert(cats, category)
        end
        ao.send({ Target = msg.From, Data = json.encode(cats) })
    end
)

-- Get all threads for a given category
Handlers.add("GetThreadsByCategory", Handlers.utils.hasMatchingTag("Action", "GetThreadsByCategory"),
    function(msg)
        local categorySlug = msg.Tags.Category
        local threadIds = ThreadsByCategory[categorySlug] or {}
        local threadsData = {}
        for _, threadId in ipairs(threadIds) do
            table.insert(threadsData, Threads[threadId])
        end
        ao.send({ Target = msg.From, Data = json.encode(threadsData) })
    end
)

-- Get all posts for a given thread
Handlers.add("GetPostsByThread", Handlers.utils.hasMatchingTag("Action", "GetPostsByThread"),
    function(msg)
        local threadId = msg.Tags.ThreadId
        local postIds = PostsByThread[threadId] or {}
        local postsData = {}
        for _, postId in ipairs(postIds) do
            table.insert(postsData, Posts[postId])
        end
        ao.send({ Target = msg.From, Data = json.encode(postsData) })
    end
)

-- Check if a user is a moderator
Handlers.add("IsModerator", Handlers.utils.hasMatchingTag("Action", "IsModerator"),
    function(msg)
        ao.send({ Target = msg.From, Data = tostring(Moderators[msg.Owner] or false) })
    end
)