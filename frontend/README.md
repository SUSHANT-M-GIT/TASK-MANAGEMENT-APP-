# TaskFlow - Full Stack Task App

This app is a small full-stack task manager made with React on the front end and Node.js on the back end.

## What this app does

- Add new tasks
- Edit tasks
- Delete tasks
- Change task status
- Search tasks
- Filter by status and priority
- Save data on the server

## Folder setup

- frontend - React app
- backend - Node API server

## How it works

1. The frontend shows the task screen.
2. The backend keeps the task data.
3. The React app calls the Node API to get, add, update, and delete tasks.
4. The browser shows the result right away.

## Run the app

From the main project folder:

```bash
npm install
npm run dev
```

This starts both servers:

- Frontend: http://localhost:5173
- Backend: http://localhost:5001

If port 5000 is already in use on your machine, this app uses 5001 by default.

## Build frontend only

```bash
npm run build
```

## Backend API

The API has these routes:

- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

## Notes

This is a mid-level app: it is not too basic, but it is also not too advanced. It uses the main features that a real task manager usually needs.
