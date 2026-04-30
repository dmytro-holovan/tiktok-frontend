# TikTok Frontend

React + Vite client for the live stream backend.

## Stack

- React + TypeScript
- Vite
- TanStack Query
- React Router
- Socket.IO client
- Lucide icons

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Default environment:

```text
VITE_API_URL=http://127.0.0.1:3000/api
VITE_LIVE_URL=http://127.0.0.1:3000/live
```

## Routes

```text
/login
/dashboard
/widget/:publicToken
```

The dashboard supports auth, TikTok platform accounts, stream connect/disconnect, stream state polling, widgets, and widget demo events.
