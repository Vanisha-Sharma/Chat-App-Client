# Chat App — Client

Frontend for the Chat App project — a real-time messaging web app built with React and Vite. Connects to the [Chat-App-Server](https://github.com/Vanisha-Sharma/Chat-App-Server) backend for authentication, messaging, and live user status.

**Live App:** [chat-app-client-eight-alpha.vercel.app](https://chat-app-client-eight-alpha.vercel.app)
**Backend repo:** [Chat-App-Server](https://github.com/Vanisha-Sharma/Chat-App-Server)

## Features

- User signup and login
- Real-time one-on-one chat via Socket.IO
- Online/offline status indicators
- Profile management with image upload
- Responsive UI built with Tailwind CSS

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Real-time:** Socket.IO client
- **State management:** React Context API
- **Deployment:** Vercel

## Project Structure

```
├── context/           # AuthContext, ChatContext (global state)
├── public/             # Static assets
├── src/
│   ├── assets/          # Images and icons
│   ├── components/       # Reusable UI components
│   ├── pages/             # Route-level pages (Home, Login, Profile)
│   ├── lib/                # Utility functions
│   ├── App.jsx               # Root component
│   └── main.jsx                # Entry point
└── vercel.json                   # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- The [backend server](https://github.com/Vanisha-Sharma/Chat-App-Server) running locally or deployed

### Installation

```bash
git clone https://github.com/Vanisha-Sharma/Chat-App-Client.git
cd Chat-App-Client
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

> Set this to your deployed backend URL (e.g. your Render domain) in production.

### Run Locally

```bash
npm run dev
```

App runs on `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder.

## Deployment

This client is deployed on [Vercel](https://vercel.com). When deploying:

1. Set the **Root Directory** to the repo root (or `client` if part of a monorepo).
2. Framework preset: Vite (auto-detected).
3. Add `VITE_BACKEND_URL` under Vercel's **Environment Variables**, pointing to your deployed backend.
4. Build command: `npm run build` · Output directory: `dist`

Make sure the backend's `CLIENT_URL` environment variable matches this app's deployed URL exactly, so CORS requests aren't blocked.

## License

This project is for educational/portfolio purposes.
