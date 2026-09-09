# AI Photo to Video Kiosk Application (1080x1920)

This is an interactive 5-screen Photo-to-Video kiosk application designed for a 1080x1920 (9:16 portrait) display, such as a Holobox or tablet kiosk. The application captures a user's photo using a webcam, overlays a custom theme frame, collects user details, saves them in MongoDB, keeps the user engaged with a multiple-choice quiz while the video generates, and displays a QR code to download the final MP4 video.

---

## 🛠️ Prerequisites

Before running the application, ensure you have the following installed on your machine:

1. **Node.js** (v18 or higher recommended)
2. **MongoDB** (A running local MongoDB instance or a MongoDB Atlas URI)
3. **FFmpeg** (Required for the fast local video compilation. If missing, the app will run in fallback mock mode)
   - **Windows Installation**: Download builds from [Gyan.dev](https://www.gyan.dev/ffmpeg/builds/) (get `ffmpeg-git-full.7z`), extract, copy the `bin/` folder path, search for "Edit the system environment variables" in Windows, edit the environment variable `Path`, click **New**, and paste the bin path. Restart your terminal.

---

## ⚙️ Configuration Setup

Create/configure the `.env` file at the root of the project folder:

```env
# Port for the Backend Express Server
PORT=5000

# MongoDB Connection String (Replace <db_password> with your Atlas password)
MONGODB_URI=mongodb+srv://neeshu:<db_password>@neeshu.cwxzomm.mongodb.net/photobooth?retryWrites=true&w=majority&appName=neeshu

# Video Generation Mode: 'local' (Fastest) or 'AI' (Cloud-based Replicate SVD)
VIDEO_GENERATION_MODE=local

# Replicate API Token (Required ONLY for 'AI' mode)
REPLICATE_API_TOKEN=your_replicate_token_here

# Local URL configurations (No change needed)
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

---

## 🚀 How to Run the Application

You can install all dependencies and run both the **Frontend** and **Backend** concurrently using single root commands:

### Step 1: Install Dependencies
Run the setup command from the **root folder** of the project to install all modules for the root, frontend, and backend:
```bash
npm run setup
```

### Step 2: Start Both Servers
Run the dev command from the **root folder** to start the Express backend server (port 5000) and the React Vite dev server (port 5173) simultaneously:
```bash
npm run dev
```

---

## 📱 Running on Multiple Devices (Phones, Tablets)

The application is configured to run across different devices dynamically. If you want someone to access the kiosk from their phone or another device on the same Wi-Fi network:

1. Find your computer's local IP address (run `ipconfig` in Command Prompt on Windows). Let's say it is `192.168.1.15`.
2. Open `http://192.168.1.15:5173` on the mobile device's browser.
3. The frontend will load and automatically route API calls to the server at `http://192.168.1.15:5000`.
4. When the video is ready, the generated QR code on Screen 6 will automatically point to `http://192.168.1.15:5000/download.html?id=<user-id>`, allowing mobile users to instantly watch and download their MP4 file!

---

## 📂 Project Structure

- `client/`: React + Vite + Tailwind CSS frontend application.
  - Contains screens 1 to 6 inside `src/components/` and `src/App.jsx`.
- `server/`: Node.js + Express backend application.
  - `server.js`: Server entry, CORS, Express middleware.
  - `routes/users.js`: Endpoints to register users, update details, save quiz answers, and poll status.
  - `services/videoService.js`: Renders portrait zoom-motion videos using FFmpeg or Replicate SVD.
  - `public/`: Stores static assets including photo uploads, generated videos, frames, and the `download.html` mobile landing page.
