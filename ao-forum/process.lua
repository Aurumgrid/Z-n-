-- AO-Forum: A Bitcointalk-style forum on AO
-- process.lua: The core backend logic for the forum application.

-- This file handles data storage, authentication, and business logic.
-- It will be populated with handlers for categories, threads, and posts in the following steps.

-- JSON library for data serialization.
-- Note: In a real AO environment, you might need to load this differently
-- or use a built-in JSON handler if available.
if json == nil then
    json = require("json")
end

-- Initialize state variables if they don't exist.
-- These are persisted across messages.
if Owner == nil then
    Owner = msg.Owner
end

if Moderators == nil then
    Moderators = { [Owner] = true }
end

if Categories == nil then
    Categories = {} -- An ordered list of category objects.
end

if Threads == nil then
    Threads = {} -- A map of categorySlug -> list of thread objects.
end

if Posts == nil then
    Posts = {} -- A map of threadId -> list of post objects.
end

-- =============================================================================
-- Handlers for Write Actions
-- =============================================================================

-- Action: RegisterCategory
-- Description: Adds a new category to the forum.
-- Auth: Only the process owner can perform this action.
if msg.Action == "RegisterCategory" then
    if msg.Owner ~= Owner then
        ao.send({ Target = msg.From, Data = "Error: Only the owner can register new categories." })
    else
        local slug = msg.Tags.Slug
        local name = msg.Tags.Name
        local description = msg.Tags.Description

        if not slug or not name or not description then
            ao.send({ Target = msg.From, Data = "Error: Missing required tags: Slug, Name, or Description." })
        else
            local category = {
                slug = slug,
                name = name,
                description = description
            }
            table.insert(Categories, category)
            ao.send({ Target = msg.From, Data = "Category '" .. name .. "' registered successfully." })
        end
    end
end

-- Action: DeletePost
-- Description: Deletes a post from a thread.
-- Auth: Moderator or the original author of the post.
if msg.Action == "DeletePost" then
    local threadId = msg.Tags.ThreadID
    local postId = msg.Tags.PostID

    if not threadId or not postId then
        ao.send({ Target = msg.From, Data = "Error: Missing required fields: ThreadID or PostID." })
    else
        local post, postIndex = nil, nil
        for i, p in ipairs(Posts[threadId] or {}) do
            if p.id == postId then
                post, postIndex = p, i
                break
            end
        end

        if not post then
            ao.send({ Target = msg.From, Data = "Error: Post not found." })
        elseif not Moderators[msg.Owner] and msg.Owner ~= post.author then
            ao.send({ Target = msg.From, Data = "Error: You do not have permission to delete this post." })
        else
            table.remove(Posts[threadId], postIndex)
            ao.send({ Target = msg.From, Data = "Post deleted successfully." })
        end
    end
end

-- Action: LockThread
-- Description: Locks a thread, preventing new posts.
-- Auth: Moderator only.
if msg.Action == "LockThread" then
    if not Moderators[msg.Owner] then
        ao.send({ Target = msg.From, Data = "Error: Only moderators can lock threads." })
    else
        local threadId = msg.Tags.ThreadID
        local threadFound = false
        for _, threadList in pairs(Threads) do
            for _, thread in ipairs(threadList) do
                if thread.id == threadId then
                    thread.locked = true
                    threadFound = true
                    break
                end
            end
            if threadFound then break end
        end
        if threadFound then
            ao.send({ Target = msg.From, Data = "Thread locked successfully." })
        else
            ao.send({ Target = msg.From, Data = "Error: Thread not found." })
        end
    end
end


-- =============================================================================
-- Handlers for Read Actions (Getters)
-- =============================================================================

-- Action: GetCategories
-- Description: Returns a list of all forum categories.
if msg.Action == "GetCategories" then
    ao.send({ Target = msg.From, Data = json.encode(Categories) })
end

-- Action: GetThreadsByCategory
-- Description: Returns a paginated list of threads for a category.
if msg.Action == "GetThreadsByCategory" then
    local categorySlug = msg.Tags.CategorySlug
    local page = tonumber(msg.Tags.Page or "1")
    local perPage = 20 -- Threads per page

    local threadList = Threads[categorySlug] or {}

    -- Sort threads by the most recent post time.
    table.sort(threadList, function(a, b)
        return a.lastPostAt > b.lastPostAt
    end)

    local totalThreads = #threadList
    local totalPages = math.ceil(totalThreads / perPage)
    local startIndex = (page - 1) * perPage + 1
    local endIndex = math.min(startIndex + perPage - 1, totalThreads)

    local paginatedThreads = {}
    for i = startIndex, endIndex do
        table.insert(paginatedThreads, threadList[i])
    end

    ao.send({
        Target = msg.From,
        Data = json.encode({
            threads = paginatedThreads,
            page = page,
            totalPages = totalPages
        })
    })
end

-- Action: GetPostsByThread
-- Description: Returns a paginated list of posts for a thread.
if msg.Action == "GetPostsByThread" then
    local threadId = msg.Tags.ThreadID
    local page = tonumber(msg.Tags.Page or "1")
    local perPage = 30 -- Posts per page

    local postList = Posts[threadId] or {}

    local totalPosts = #postList
    local totalPages = math.ceil(totalPosts / perPage)
    local startIndex = (page - 1) * perPage + 1
    local endIndex = math.min(startIndex + perPage - 1, totalPosts)

    local paginatedPosts = {}
    for i = startIndex, endIndex do
        table.insert(paginatedPosts, postList[i])
    end

    ao.send({
        Target = msg.From,
        Data = json.encode({
            posts = paginatedPosts,
            page = page,
            totalPages = totalPages
        })
    })
end

-- Action: CreateThread
-- Description: Creates a new discussion thread within a category.
-- Auth: Any user can perform this action. Signature is implicitly verified by AO.
if msg.Action == "CreateThread" then
    local categorySlug = msg.Tags.CategorySlug
    local title = msg.Tags.Title
    local content = msg.Data

    if not categorySlug or not title or not content or content == "" then
        ao.send({ Target = msg.From, Data = "Error: Missing required fields: CategorySlug, Title, or message data." })
    else
        local threadId = msg.Id
        local timestamp = msg.Timestamp

        local thread = {
            id = threadId,
            categorySlug = categorySlug,
            title = title,
            creator = msg.Owner,
            createdAt = timestamp,
            lastPostAt = timestamp
        }

        if Threads[categorySlug] == nil then
            Threads[categorySlug] = {}
        end
        table.insert(Threads[categorySlug], thread)

        -- The first post of a thread contains the initial content.
        local post = {
            id = msg.Id, -- The first post ID is the same as the thread ID.
            threadId = threadId,
            author = msg.Owner,
            content = content,
            createdAt = timestamp
        }

        if Posts[threadId] == nil then
            Posts[threadId] = {}
        end
        table.insert(Posts[threadId], post)

        ao.send({ Target = msg.From, Data = "Thread created successfully. Thread ID: " .. threadId })
    end
end

-- Action: CreatePost
-- Description: Adds a reply to an existing thread.
-- Auth: Any user can perform this action.
if msg.Action == "CreatePost" then
    local threadId = msg.Tags.ThreadID
    local content = msg.Data

    if not threadId or not content or content == "" then
        ao.send({ Target = msg.From, Data = "Error: Missing required fields: ThreadID or message data." })
    else
        local postId = msg.Id
        local timestamp = msg.Timestamp

        local post = {
            id = postId,
            threadId = threadId,
            author = msg.Owner,
            content = content,
            createdAt = timestamp
        }

        if Posts[threadId] == nil then
            ao.send({ Target = msg.From, Data = "Error: Thread with ID " .. threadId .. " does not exist." })
        else
            table.insert(Posts[threadId], post)

            -- Update the lastPostAt timestamp for the parent thread to keep it on top.
            local threadFound = false
            for _, threadList in pairs(Threads) do
                for _, thread in ipairs(threadList) do
                    if thread.id == threadId then
                        thread.lastPostAt = timestamp
                        threadFound = true
                        break
                    end
                end
                if threadFound then break end
            end

            ao.send({ Target = msg.From, Data = "Post created successfully. Post ID: " .. postId })
        end
    end
end