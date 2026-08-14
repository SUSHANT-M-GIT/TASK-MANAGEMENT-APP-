# TaskFlow - Full Stack Task App

This app is a small full-stack task manager made with React on the front end and Node.js on the back end.

## What this app does

- Add new tasks
- Edit tasks
- Delete tasks
- Change task status
- Search tasks
- Filter by status and priority
- Sort tasks (newest, oldest, priority, due soon)
- Quick completion checkbox
- Date and time validation
- Save data on the server

## Folder setup

- `frontend/` - React app with Vite
- `backend/` - Node.js Express API server

## How it works

1. The frontend shows the task screen.
2. The backend keeps the task data.
3. The React app calls the Node API to get, add, update, and delete tasks.
4. The browser shows the result right away.

## How to run

### Development mode (both frontend + backend together)

From the main project folder:

```bash
npm install
npm run dev
```

This starts both servers:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

### Production mode (build frontend, then run backend)

```bash
npm install
npm run prod
```

Then open the URL shown in the terminal (usually `http://localhost:5001`)

### Run backend only (after building frontend)

```bash
cd backend
npm start
```

## Build frontend

```bash
npm run build
```

This creates the production bundle in `frontend/dist/`.

## Backend API

The backend serves both the API and the built frontend. Routes:

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

All other routes serve the frontend (SPA fallback).

## Tech Stack

- **Frontend:** React 18, Vite, CSS3
- **Backend:** Node.js, Express, CORS
- **Storage:** In-memory (can be upgraded to database)

## Features

- Create tasks with title, description, priority (High/Medium/Low), and due date + time
- Edit existing tasks
- Delete tasks
- Mark tasks as Completed, Pending, or In Progress
- Search tasks by title
- Filter by status or priority
- Sort by newest, oldest, priority, or due date
- Responsive design
- Past date validation (cannot create tasks with past dates)

## NOTES 

- **IT'S NOT THAT ADVANCED LEVEL APP BUT IT STILL HAS ALL THE FUNCTIONALITIES AND BACKEND CONNECTED WHERE DATA GETS'S STORED**
- **ITS'S A REACT APP WHICH I HAVE BUILD AFTER LEARNING THE REACT FUNCTIONALITIES AND PRACTICING IT THROUGH YOUTUBE CHANNELS**
- **JUST A GIVE A TRY**
