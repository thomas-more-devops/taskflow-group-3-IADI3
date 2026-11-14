const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./database');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

// Rate limit: at most 300 requests per minute per client on the API (behind nginx all clients share the proxy IP)
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

// Only these fields can be set by a client, and only as plain values (never objects),
// so a body like {"completed": {"$ne": null}} cannot reach MongoDB as an operator
const FIELDS = ['title', 'priority', 'category', 'dueDate', 'completed', 'completedAt', 'createdAt'];
const pick = (body = {}) => {
  const out = {};
  for (const key of FIELDS) {
    const value = body[key];
    if (['string', 'number', 'boolean'].includes(typeof value) || value === null) out[key] = value;
  }
  return out;
};

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Health check: lets Docker, CI or a person check that the server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// API Routes with MongoDB
app.get('/api/tasks', wrap(async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
}));

app.post('/api/tasks', wrap(async (req, res) => {
  const task = new Task(pick(req.body));
  await task.save();
  res.status(201).json(task);
}));

app.delete('/api/tasks/:id', wrap(async (req, res) => {
  await Task.findByIdAndDelete(String(req.params.id));
  res.status(204).send();
}));

app.put('/api/tasks/:id', wrap(async (req, res) => {
  const task = await Task.findByIdAndUpdate(String(req.params.id), pick(req.body), { new: true, runValidators: true });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
}));

// Error handler: has to come after the routes
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = ['CastError', 'ValidationError'].includes(err.name) ? 400 : 500;
  res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
