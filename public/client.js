const socket = io();

function createPollElement(poll) {
  const container = document.createElement('div');
  container.className = 'poll';
  const title = document.createElement('h3');
  title.textContent = poll.question;
  container.appendChild(title);

  const list = document.createElement('div');
  list.className = 'options';

  const total = poll.options.reduce((s, o) => s + (o.votes || 0), 0) || 0;

  poll.options.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'optionRow';

    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.onclick = () => {
      socket.emit('vote', { pollId: poll.id, optionId: opt.id });
    };

    const meta = document.createElement('div');
    meta.className = 'meta';
    const percent = total === 0 ? 0 : Math.round((opt.votes / total) * 100);
    meta.innerHTML = `<div class="bar" style="width:${percent}%"></div><div class="percent">${opt.votes || 0} (${percent}%)</div>`;

    row.appendChild(btn);
    row.appendChild(meta);
    list.appendChild(row);
  });

  container.appendChild(list);
  return container;
}

function renderPolls(polls) {
  const list = document.getElementById('pollList');
  list.innerHTML = '';
  if (!polls || polls.length === 0) {
    list.textContent = 'No hay encuestas aún.';
    return;
  }
  polls.slice().reverse().forEach(p => {
    list.appendChild(createPollElement(p));
  });
}

// UI interactions
document.getElementById('createBtn').addEventListener('click', () => {
  const question = document.getElementById('question').value.trim();
  const raw = document.getElementById('options').value.trim();
  const options = raw.split('\n').map(s => s.trim()).filter(Boolean);
  if (!question || options.length < 2) {
    alert('Necesitas una pregunta y al menos 2 opciones');
    return;
  }
  socket.emit('createPoll', { question, options });
  document.getElementById('question').value = '';
  document.getElementById('options').value = '';
});

socket.on('connect', () => {
  console.log('connected');
});

socket.on('initialData', (data) => {
  renderPolls(data);
});

socket.on('pollCreated', (poll) => {
  // prepend
  const list = document.getElementById('pollList');
  const el = createPollElement(poll);
  if (list.firstChild && list.firstChild.textContent === 'No hay encuestas aún.') list.innerHTML = '';
  list.insertBefore(el, list.firstChild);
});

socket.on('pollUpdated', (poll) => {
  // update single poll in DOM by id
  const list = document.getElementById('pollList');
  const polls = Array.from(list.getElementsByClassName('poll'));
  // simple approach: re-fetch all polls from server
  fetch('/api/polls').then(r => r.json()).then(renderPolls);
});
