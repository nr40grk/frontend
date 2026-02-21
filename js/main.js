// ─── CONFIG ───
// Replace with your actual Render backend URL
const API_URL = 'https://inktemple-api.onrender.com';

// ─── LANGUAGE ───
let lang = localStorage.getItem('lang') || 'gr';

function t(el) {
  return el.getAttribute('data-' + lang) || el.getAttribute('data-gr') || '';
}

function applyLang() {
  document.querySelectorAll('[data-gr]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (!val) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const ph = el.getAttribute('data-ph-' + lang);
      if (ph) el.placeholder = ph;
      return;
    }

    if (el.tagName === 'OPTION') {
      const grVal = el.getAttribute('data-gr');
      const enVal = el.getAttribute('data-en');
      if (grVal && enVal) el.textContent = lang === 'gr' ? grVal : enVal;
      return;
    }

    if (val.includes('<')) el.innerHTML = val;
    else el.textContent = val;
  });

  // Update lang button
  const btn = document.getElementById('langBtn');
  if (btn) btn.textContent = lang === 'gr' ? 'EN' : 'ΕΛ';
  const mBtn = document.getElementById('mobileLangBtn');
  if (mBtn) mBtn.textContent = lang === 'gr' ? 'EN' : 'ΕΛ';

  document.documentElement.lang = lang === 'gr' ? 'el' : 'en';
}

function toggleLang() {
  lang = lang === 'gr' ? 'en' : 'gr';
  localStorage.setItem('lang', lang);
  applyLang();
  // Let pages react to lang change
  if (typeof onLangChange === 'function') onLangChange();
}

// ─── NAV SCROLL ───
function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(path)) a.classList.add('active');
  });
}

// ─── MOBILE MENU ───
function initMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu || !hamburger) return;

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ─── API HELPERS ───
async function apiGet(endpoint) {
  const res = await fetch(API_URL + endpoint);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiPostForm(endpoint, formData) {
  const res = await fetch(API_URL + endpoint, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// ─── AUTH ───
function getToken() { return localStorage.getItem('admin_token'); }
function setToken(t) { localStorage.setItem('admin_token', t); }
function clearToken() { localStorage.removeItem('admin_token'); }
function isLoggedIn() { return !!getToken(); }

async function authHeaders() {
  return { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}

async function apiAuthGet(endpoint) {
  const res = await fetch(API_URL + endpoint, { headers: await authHeaders() });
  if (res.status === 401) { clearToken(); window.location.href = '/admin/login.html'; return; }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiAuthPost(endpoint, data, method = 'POST') {
  const res = await fetch(API_URL + endpoint, {
    method,
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (res.status === 401) { clearToken(); window.location.href = '/admin/login.html'; return; }
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiAuthFormPost(endpoint, formData, method = 'POST') {
  const token = getToken();
  const res = await fetch(API_URL + endpoint, {
    method,
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (res.status === 401) { clearToken(); window.location.href = '/admin/login.html'; return; }
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiAuthDelete(endpoint) {
  const res = await fetch(API_URL + endpoint, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  const json = await res.json();
  if (res.status === 401) { clearToken(); window.location.href = '/admin/login.html'; return; }
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

async function apiAuthPatch(endpoint, data) {
  const res = await fetch(API_URL + endpoint, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// ─── SHOW ALERT ───
function showAlert(id, type, msgGr, msgEn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.textContent = lang === 'gr' ? msgGr : msgEn;
  setTimeout(() => el.classList.remove('show'), 6000);
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  applyLang();

  document.getElementById('langBtn')?.addEventListener('click', toggleLang);
  document.getElementById('mobileLangBtn')?.addEventListener('click', toggleLang);
});