const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const preferredPort = Number(process.env.PORT) || 5001;

function startServer(port) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`TaskFlow backend running on http://0.0.0.0:${port}`);
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.log(`Port ${port} is busy. Trying ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Server error:', error);
    process.exit(1);
  });
}

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Serve built frontend (if present)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

let tasks = [
  {
    id: 1,
    title: 'Plan sprint tasks',
    description: 'List key work for the next 7 days and assign owners.',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-08-18',
  },
  {
    id: 2,
    title: 'Review project goals',
    description: 'Check deliverables and confirm the final user requirements.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-08-20',
  },
  {
    id: 3,
    title: 'Update design notes',
    description: 'Add new UI notes and update the communication doc.',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2026-08-12',
  },
];

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

const isPastTaskDate = (dateString, timeString) => {
  if (!dateString) return false;

  const pickedDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (pickedDate < today) return true;
  if (pickedDate > today) return false;

  if (!timeString) return false;

  const [hours, minutes] = timeString.split(':').map(Number);
  const selectedTime = new Date();
  selectedTime.setHours(hours, minutes, 0, 0);

  return selectedTime < new Date();
};

app.post('/api/tasks', (req, res) => {
  const { title, description, priority, status, dueDate, dueTime } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  if (dueDate && isPastTaskDate(dueDate, dueTime)) {
    return res.status(400).json({ message: 'Please choose a future date and time for the task.' });
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'Medium',
    status: status || 'Pending',
    dueDate: dueDate || '',
    dueTime: dueTime || '',
  };

  tasks = [newTask, ...tasks];
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, priority, status, dueDate, dueTime } = req.body;

  if (dueDate && isPastTaskDate(dueDate, dueTime)) {
    return res.status(400).json({ message: 'Please choose a future date and time for the task.' });
  }

  tasks = tasks.map((task) =>
    String(task.id) === String(id)
      ? {
          ...task,
          title: title?.trim() || task.title,
          description: description?.trim() ?? task.description,
          priority: priority || task.priority,
          status: status || task.status,
          dueDate: dueDate ?? task.dueDate,
          dueTime: dueTime ?? task.dueTime,
        }
      : task
  );

  const updatedTask = tasks.find((task) => String(task.id) === String(id));
  res.json(updatedTask);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((task) => String(task.id) !== String(id));
  res.json({ message: 'Task deleted successfully' });
});

// For any non-API route, return the frontend index.html (SPA fallback)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();

  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

startServer(preferredPort);
