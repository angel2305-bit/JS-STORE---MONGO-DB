const API = (() => {
  const BASE = '';
  function _headers() {
    const token = localStorage.getItem('token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }
  async function _req(method, url, body) {
    const opts = { method, headers: _headers() };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(BASE + url, opts);
    const data = await res.json();
    if (res.status === 401 || res.status === 403) { Auth.logout(); throw new Error('Sesion expirada'); }
    if (!res.ok) throw new Error(data.message || 'Error del servidor');
    return data;
  }
  return {
    get:    (url)       => _req('GET',    url),
    post:   (url, body) => _req('POST',   url, body),
    put:    (url, body) => _req('PUT',    url, body),
    delete: (url)       => _req('DELETE', url),
  };
})();

const Toast = {
  show(msg, tipo = 'info', ms = 3000) {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${tipo}`; t.textContent = msg;
    c.appendChild(t); setTimeout(() => t.remove(), ms);
  },
  ok:    (msg) => Toast.show(msg, 'success'),
  error: (msg) => Toast.show(msg, 'error'),
  info:  (msg) => Toast.show(msg, 'info'),
};

const Modal = {
  abrir(titulo, html) {
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('open');
  },
  cerrar() { document.getElementById('modalOverlay').classList.remove('open'); }
};

function formatCOP(val) { return '$' + Number(val).toLocaleString('es-CO'); }
function formatFecha(iso) { return new Date(iso).toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }); }
const EMOJIS = { 'Camisas':'👕','Jeans':'👖','Gorras':'🧢','Calzado':'👟','Hoodies':'🧥','General':'🏷️' };
function emojiCategoria(cat) { return EMOJIS[cat] || '🏷️'; }
