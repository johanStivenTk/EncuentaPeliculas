const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// In-memory store (simple, not persistent)
const polls = new Map();

function createPoll(question, options) {
  const id = randomUUID();
  const opts = options.map((text, idx) => ({ id: String(idx + 1), text: text.trim(), votes: 0 }));
  const poll = { id, question: question.trim(), options: opts, createdAt: Date.now() };
  polls.set(id, poll);
  return poll;
}

app.get('/api/polls', (req, res) => {
  res.json(Array.from(polls.values()));
});

app.post('/api/polls', (req, res) => {
  const { question, options } = req.body;
  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'question and at least two options are required' });
  }
  const poll = createPoll(question, options);
  io.emit('pollCreated', poll);
  res.status(201).json(poll);
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);
  // send current polls
  socket.emit('initialData', Array.from(polls.values()));

  socket.on('createPoll', (data) => {
    try {
      const { question, options } = data;
      if (!question || !Array.isArray(options) || options.length < 2) return;
      const poll = createPoll(question, options);
      io.emit('pollCreated', poll);
    } catch (err) {
      console.error('createPoll error', err);
    }
  });

  socket.on('vote', ({ pollId, optionId }) => {
    const poll = polls.get(pollId);
    if (!poll) return;
    const opt = poll.options.find(o => o.id === optionId);
    if (!opt) return;
    opt.votes = (opt.votes || 0) + 1;
    io.emit('pollUpdated', poll);
  });

  socket.on('disconnect', () => {
    // no-op
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
