# AO Bitcointalk-Style Forum

This project is a decentralized, Bitcointalk-style forum built on the AO network. It features a Lua backend process for all data and logic, and a lightweight, reactive frontend built with Alpine.js.

## Project Structure

-   `/process`: Contains the Lua script (`forum.lua`) for the AO process.
-   `/ui`: Contains the frontend files (`index.html`, `style.css`, `app.js`).

## Deployment Instructions

Follow these steps to deploy and run your own instance of the forum.

### Step 1: Deploy the Backend AO Process

You will need the `aos` command-line tool installed to deploy the backend process.

1.  **Deploy the Lua script:**
    Navigate to the `process` directory and run the following command to deploy `forum.lua` as a new AO process:

    ```bash
    aos --load forum.lua
    ```

2.  **Get the Process ID:**
    After a successful deployment, the `aos` tool will output a `Process-Id`. It will look something like this:

    ```
    Process-Id: YOUR_PROCESS_ID_HERE
    ```

    Copy this ID. You will need it to configure the frontend.

### Step 2: Configure the Frontend

1.  **Open the JavaScript file:**
    Navigate to `ui/app.js`.

2.  **Update the Process ID:**
    Find the following line in the file:

    ```javascript
    AO_PROCESS_ID: "YOUR_PROCESS_ID_HERE", // User must replace this
    ```

    Replace `"YOUR_PROCESS_ID_HERE"` with the actual `Process-Id` you copied in the previous step.

### Step 3: Deploy the Frontend to Netlify

The easiest way to deploy the frontend is by using Netlify's drag-and-drop interface.

1.  **Log in to Netlify:**
    Go to [app.netlify.com](https://app.netlify.com) and log in to your account.

2.  **Drag and Drop the UI Folder:**
    From your Netlify dashboard, simply drag the entire `ui` folder from your local machine and drop it onto the Netlify "Sites" page.

3.  **Deployment:**
    Netlify will automatically build and deploy your site. Once it's finished, you will be given a public URL where you can access your forum.

### Step 4: Using the Forum

1.  **Install ArConnect:**
    To interact with the forum (post, like, etc.), you will need the ArConnect browser extension installed.

2.  **Connect Your Wallet:**
    Visit your deployed forum URL and click the "Connect Wallet" button to authorize the application.

3.  **Start Posting:**
    You can now create threads and posts. Your actions will be signed with your wallet and sent to the AO process.

## How It Works

-   **Backend:** All forum data (categories, threads, posts, likes) is stored in the AO process's key-value store. All actions are handled by the Lua script, which verifies signatures and updates the state.
-   **Frontend:** The frontend is a simple HTML/CSS/JS application that communicates with the AO process via `ao.dryrun` (for reading data) and `ao.send` (for writing data). It uses Alpine.js for lightweight DOM manipulation and reactivity.
-   **Real-time Updates:** The backend uses Lattica events to push notifications for new posts. The frontend listens for these events and updates the UI in real-time, providing a seamless user experience.