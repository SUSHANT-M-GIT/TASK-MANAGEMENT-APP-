import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api/tasks';

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPastDate = (dateString, timeString) => {
  if (!dateString) return false;

  const pickedDate = new Date(`${dateString}T00:00:00`);
  const today = new Date(`${getTodayString()}T00:00:00`);

  if (pickedDate < today) return true;

  if (pickedDate > today) return false;

  if (!timeString) return false;

  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const selectedTime = new Date();
  selectedTime.setHours(hours, minutes, 0, 0);

  return selectedTime < now;
};

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'Pending',
  dueDate: getTodayString(),
  dueTime: '',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to load tasks');
      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('Could not connect to the server. Please start the Node backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const searchValue = search.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(searchValue) ||
        (task.description || '').toLowerCase().includes(searchValue);
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'oldest') {
        return Number(a.id) - Number(b.id);
      }

      if (sortBy === 'priority') {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }

      if (sortBy === 'due-soon') {
        const aDate = a.dueDate ? new Date(`${a.dueDate}T${a.dueTime || '00:00'}`).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate ? new Date(`${b.dueDate}T${b.dueTime || '00:00'}`).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }

      return Number(b.id) - Number(a.id);
    });
  }, [tasks, search, statusFilter, priorityFilter, sortBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const pending = tasks.filter((task) => task.status === 'Pending').length;
    const inProgress = tasks.filter((task) => task.status === 'In Progress').length;

    return { total, completed, pending, inProgress };
  }, [tasks]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert('Task title is required.');
      return;
    }

    if (form.dueDate && isPastDate(form.dueDate, form.dueTime)) {
      alert('Please choose a future date and time for the task.');
      return;
    }

    try {
      const method = editingId !== null ? 'PUT' : 'POST';
      const url = editingId !== null ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Task save failed');
      }

      resetForm();
      await fetchTasks();
    } catch (err) {
      alert(err.message || 'There was a problem saving the task. Please try again.');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate || getTodayString(),
      dueTime: task.dueTime || '',
    });
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      if (editingId === taskId) resetForm();
      await fetchTasks();
    } catch (err) {
      alert('Unable to delete task right now.');
    }
  };

  const updateTaskStatus = async (taskId, nextStatus) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    if (!taskToUpdate) return;

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskToUpdate, status: nextStatus, dueDate: taskToUpdate.dueDate || '', dueTime: taskToUpdate.dueTime || '' }),
      });

      if (!response.ok) throw new Error('Status update failed');
      await fetchTasks();
    } catch (err) {
      alert('Failed to update the task status.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>TaskFlow</h1>
        </div>
        <div className="topbar-info">
          <span>{stats.total} total tasks</span>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              resetForm();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Add new task
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card accent-blue">
          <span>Total</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card accent-orange">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="stat-card accent-green">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>
        <div className="stat-card accent-purple">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>
      </section>

      <main className="content-layout">
        <aside className="panel form-panel">
          <h2>{editingId === null ? 'Create Task' : 'Edit Task'}</h2>

          <form onSubmit={handleSubmit} className="task-form">
            <label>
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Task title"
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Add task details"
              />
            </label>

            <div className="two-col">
              <label>
                <span>Priority</span>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label>
                <span>Status</span>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>

            <div className="two-col">
              <label>
                <span>Due date</span>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  min={getTodayString()}
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Due time</span>
                <input type="time" name="dueTime" value={form.dueTime} onChange={handleChange} />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn full-width">
                {editingId === null ? 'Save Task' : 'Update Task'}
              </button>
              {editingId !== null && (
                <button type="button" className="secondary-btn full-width" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </aside>

        <section className="panel list-panel">
          <div className="list-header">
            <h2>Task List</h2>
          </div>

          <div className="filter-bar">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
            />

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
              <option value="due-soon">Due soon</option>
            </select>
          </div>

          {(search || statusFilter !== 'All' || priorityFilter !== 'All') && (
            <div className="clear-row">
              <button
                type="button"
                className="secondary-btn clear-btn"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {error && <div className="empty-state"><p>{error}</p></div>}

          <div className="task-list">
            {loading ? (
              <div className="empty-state">
                <p>Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks match your current filters.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <article key={task.id} className="task-card">
                  <div className="task-card-top">
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description || 'No description added.'}</p>
                    </div>
                    <span className={`badge priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="meta-row">
                    <span className={`badge status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {task.status}
                    </span>
                    {task.dueDate && (
                      <span>
                        Due: {task.dueDate}
                        {task.dueTime ? ` at ${task.dueTime}` : ''}
                      </span>
                    )}
                  </div>

                  <div className="task-actions">
                    <div className="status-inline">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        aria-label={`Update status for ${task.title}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <label className="checkbox-wrap">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completed'}
                          onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'Completed' : 'Pending')}
                        />
                        <span>Done</span>
                      </label>
                    </div>

                    <button type="button" className="secondary-btn" onClick={() => handleEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="danger-btn" onClick={() => handleDelete(task.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
