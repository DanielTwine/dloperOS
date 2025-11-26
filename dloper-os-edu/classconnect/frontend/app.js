const API_BASE = '/api';
let authToken = localStorage.getItem('cc_token');
let currentUser = null;

const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboard');
const classesSection = document.getElementById('classes');
const homeworkSection = document.getElementById('homework');
const authState = document.getElementById('authState');
const loginForm = document.getElementById('loginForm');
const newClassBtn = document.getElementById('newClassBtn');
const newClassForm = document.getElementById('newClassForm');
const classList = document.getElementById('classList');
const newHomeworkBtn = document.getElementById('newHomeworkBtn');
const newHomeworkForm = document.getElementById('newHomeworkForm');
const homeworkList = document.getElementById('homeworkList');
const statsEl = document.getElementById('stats');

function showAuthedUI(user) {
  currentUser = user;
  authState.textContent = `${user.email} (${user.role})`;
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  classesSection.classList.remove('hidden');
  homeworkSection.classList.remove('hidden');
}

function showLoggedOut() {
  authToken = null;
  localStorage.removeItem('cc_token');
  currentUser = null;
  authState.textContent = 'Not signed in';
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
  classesSection.classList.add('hidden');
  homeworkSection.classList.add('hidden');
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

async function handleLogin(e) {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());
  try {
    const { token, user } = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    authToken = token;
    localStorage.setItem('cc_token', token);
    showAuthedUI(user);
    await loadDashboard();
    await loadClasses();
    await loadHomework();
  } catch (err) {
    alert(err.message);
  }
}

async function loadDashboard() {
  const data = await api('/dashboard');
  statsEl.innerHTML = '';
  const statItems = [
    { label: 'Classes', value: data.stats.classes },
    { label: 'Homework', value: data.stats.homework },
    { label: 'Behaviour', value: data.stats.behaviourEvents },
    { label: 'Today entries', value: data.stats.timetableToday.length },
  ];
  statItems.forEach((s) => {
    const el = document.createElement('div');
    el.className = 'stat';
    el.innerHTML = `<div class="label">${s.label}</div><div class="value">${s.value}</div>`;
    statsEl.appendChild(el);
  });
}

async function loadClasses() {
  const data = await api('/classes');
  classList.innerHTML = '';
  data.classes.forEach((c) => {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `<strong>${c.name}</strong> <span class="muted">#${c.id}</span> — Teacher ID: ${c.teacherId}`;
    classList.appendChild(el);
  });
}

async function loadHomework() {
  const data = await api('/homework');
  homeworkList.innerHTML = '';
  data.homework.forEach((h) => {
    const el = document.createElement('div');
    el.className = 'list-item';
    const due = new Date(h.dueDate).toLocaleDateString();
    el.innerHTML = `<strong>${h.title}</strong> <span class="muted">${due}</span><div>${h.description}</div>`;
    homeworkList.appendChild(el);
  });
}

newClassBtn.addEventListener('click', () => {
  newClassForm.classList.toggle('hidden');
});

newClassForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(newClassForm).entries());
  payload.schoolId = Number(payload.schoolId);
  try {
    await api('/classes/create', { method: 'POST', body: JSON.stringify(payload) });
    newClassForm.reset();
    newClassForm.classList.add('hidden');
    await loadClasses();
  } catch (err) {
    alert(err.message);
  }
});

newHomeworkBtn.addEventListener('click', () => {
  newHomeworkForm.classList.toggle('hidden');
});

newHomeworkForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(newHomeworkForm).entries());
  payload.classId = Number(payload.classId);
  try {
    await api('/homework/create', { method: 'POST', body: JSON.stringify(payload) });
    newHomeworkForm.reset();
    newHomeworkForm.classList.add('hidden');
    await loadHomework();
  } catch (err) {
    alert(err.message);
  }
});

loginForm.addEventListener('submit', handleLogin);

(async function bootstrap() {
  if (!authToken) return showLoggedOut();
  try {
    const { user } = await api('/auth/me');
    showAuthedUI(user);
    await loadDashboard();
    await loadClasses();
    await loadHomework();
  } catch (err) {
    showLoggedOut();
  }
})();
