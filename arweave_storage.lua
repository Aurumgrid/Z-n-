--[[
================================================================
  AO Process: Permanent File Storage with Arweave
  Version: 1.0.0
  Author: Jules
================================================================

  This script provides a simple, robust contract for tracking file
  metadata for assets stored permanently on the Arweave network.
  It allows users to register an Arweave Transaction ID (TXID),
  associate it with metadata like a name and size, and prove
  ownership via their wallet address.

  Core Actions:
  - Upload: Registers a new file by its Arweave TXID.
  - List:   Retrieves a list of all files registered by the caller.
  - Delete: Removes a file registration, restricted to the original uploader.
--]]

-- State is automatically persisted by the AO runtime.
-- We store uploads in a table mapping the owner's wallet address
-- to an array of their file records.
if not state then
    state = {
        uploads = {} -- { owner_address = { { txid, name, size, timestamp }, ... } }
    }
end

-- Handlers for incoming messages
Handlers = Handlers or {}

---
-- Upload Handler: Registers a new file's metadata.
-- The file binary is expected to be already uploaded to Arweave.
--
-- @param msg The message object from the AO runtime.
--            msg.Owner: The wallet address of the sender.
--            msg.Data: A JSON string with { txid, name, size }.
--
function Handlers.Upload(msg)
    local json = require("json")
    local payload = json.decode(msg.Data)

    -- Validate the payload
    if not payload.txid or not payload.name or not payload.size then
        msg.reply({
            Error = "Invalid payload: 'txid', 'name', and 'size' are required."
        })
        return
    end

    -- Create the metadata record
    local record = {
        txid = payload.txid,
        name = payload.name,
        size = payload.size,
        timestamp = os.time()
    }

    -- Initialize the owner's upload list if it doesn't exist
    if not state.uploads[msg.Owner] then
        state.uploads[msg.Owner] = {}
    end

    -- Add the record to the owner's list
    table.insert(state.uploads[msg.Owner], record)

    -- Send a confirmation reply
    msg.reply({
        Success = "Upload registered successfully.",
        Record = record
    })
end

---
-- List Handler: Retrieves all file records for the calling user.
--
-- @param msg The message object from the AO runtime.
--
function Handlers.List(msg)
    local owner_uploads = state.uploads[msg.Owner] or {}

    msg.reply({
        Data = owner_uploads
    })
end

---
-- Delete Handler: Removes a file record.
-- Only the original uploader can delete their own records.
--
-- @param msg The message object from the AO runtime.
--            msg.Data: A JSON string with { txid }.
--
function Handlers.Delete(msg)
    local json = require("json")
    local payload = json.decode(msg.Data)

    if not payload.txid then
        msg.reply({ Error = "Invalid payload: 'txid' is required." })
        return
    end

    local owner_uploads = state.uploads[msg.Owner]
    if not owner_uploads then
        msg.reply({ Error = "No uploads found for this owner." })
        return
    end

    -- Find the index of the record with the matching TXID
    local record_index = -1
    for i, record in ipairs(owner_uploads) do
        if record.txid == payload.txid then
            record_index = i
            break
        end
    end

    if record_index == -1 then
        msg.reply({ Error = "File with specified TXID not found." })
        return
    end

    -- Remove the record from the table
    table.remove(owner_uploads, record_index)

    msg.reply({
        Success = "File record deleted successfully.",
        Txid = payload.txid
    })
end