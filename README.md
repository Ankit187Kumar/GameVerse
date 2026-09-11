# AI Photo to Video Kiosk Application (1080x1920)

🔗 **Live Demo:** https://gameverse-opal.vercel.app/

An interactive Photo-to-Video kiosk application designed for a **1080x1920 (9:16 portrait)** display, such as a Holobox, tablet, or exhibition kiosk.

The application captures a user's photo, applies a custom theme frame, collects user details, stores them in MongoDB, provides a multiple-choice quiz while the video generates, and displays a QR code to view and download the final MP4 video.

---

## 🛠️ Prerequisites

* **Node.js** v18 or higher
* **MongoDB** local installation or MongoDB Atlas
* **FFmpeg** for local video generation

For Windows, install FFmpeg and add its `bin` folder to the system `Path`.

---

## ⚙️ Configuration



## 🚀 How to Run

### Install Dependencies

```bash
npm run setup
```

### Start Frontend & Backend

```bash
npm run dev
```

The application runs on:

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5000`

---

## 📱 Multiple Device Access

To access the kiosk from another device on the same Wi-Fi:

1. Run `ipconfig` and find your computer's local IP.
2. Open the following on the phone/tablet:

```text
http://YOUR-IP:5173
```

The generated QR code will provide access to the final MP4 video through the backend download page.

---

## 📂 Project Structure

```text
project-root/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Kiosk screens
│   │   └── App.jsx
│   └── ...
│
├── server/                 # Node.js + Express backend
│   ├── server.js
│   ├── routes/
│   │   └── users.js
│   ├── services/
│   │   └── videoService.js
│   └── public/              # Photos, videos, frames & download page
│
├── .env
├── package.json
└── README.md
```

---

## 🎬 Video Generation

### Local Mode

```env
VIDEO_GENERATION_MODE=local
```

Uses FFmpeg for fast local video generation.

### AI Mode

```env
VIDEO_GENERATION_MODE=AI
```

Uses Replicate SVD for cloud-based AI video generation and requires a Replicate API token.

---

## 🔄 Application Flow

**Photo Capture → Theme Frame → User Details → Quiz → Video Generation → QR Code → MP4 Download**

---

## 👨‍💻 Developer

**Ankit Chaudhary**

GitHub: **Ankit187Kumar**

---

## 📄 License

Created for kiosk, exhibition, and interactive digital experience applications.
