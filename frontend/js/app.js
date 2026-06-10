const Auth = (() => {
  async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    document.getElementById('loginError').textContent = '';
    if (!email||!password) { document.getElementById('loginError').textContent='Completa todos los campos'; return; }
    try {
      const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const data = await res.json();
      if (!data.success) { document.getElementById('loginError').textContent=data.message; return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      _mostrarApp(data.usuario);
    } catch { document.getElementById('loginError').textContent='Error de conexión'; }
  }
  async function registro() {
    const nombre=document.getElementById('regNombre').value.trim(), apellido=document.getElementById('regApellido').value.trim(), email=document.getElementById('regEmail').value.trim(), password=document.getElementById('regPassword').value, telefono=document.getElementById('regTelefono').value.trim();
    document.getElementById('registroError').textContent='';
    if (!nombre||!email||!password) { document.getElementById('registroError').textContent='Nombre, email y contraseña son obligatorios'; return; }
    if (password.length<6) { document.getElementById('registroError').textContent='La contraseña debe tener mínimo 6 caracteres'; return; }
    try {
      const res = await fetch('/api/auth/registro', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({nombre,apellido,email,password,telefono}) });
      const data = await res.json();
      if (!data.success) { document.getElementById('registroError').textContent=data.message; return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      _mostrarApp(data.usuario);
    } catch { document.getElementById('registroError').textContent='Error de conexión'; }
  }
  function logout() {
    localStorage.removeItem('token'); localStorage.removeItem('usuario'); Carrito.limpiar();
    document.getElementById('pantallaAuth').style.display='block';
    document.getElementById('appPrincipal').style.display='none';
    mostrarLogin();
  }
  function _mostrarApp(usuario) {
    document.getElementById('pantallaAuth').style.display='none';
    document.getElementById('appPrincipal').style.display='block';
    document.getElementById('userNombre').textContent=usuario.nombre+' ('+usuario.rol+')';
    if (usuario.rol==='admin') {
      document.getElementById('navAdmin').style.display='flex';
      document.getElementById('navCliente').style.display='none';
      App.ir('adminDashboard');
    } else {
      document.getElementById('navCliente').style.display='flex';
      document.getElementById('navAdmin').style.display='none';
      App.ir('catalogo');
    }
  }
  function mostrarLogin() { document.getElementById('formLogin').style.display='block'; document.getElementById('formRegistro').style.display='none'; }
  function mostrarRegistro() { document.getElementById('formLogin').style.display='none'; document.getElementById('formRegistro').style.display='block'; }
  async function init() {
    const token=localStorage.getItem('token'), usuario=localStorage.getItem('usuario');
    if (token&&usuario) {
      const res=await fetch('/api/auth/verificar',{headers:{'Authorization':'Bearer '+token}});
      const data=await res.json();
      if (data.success) { _mostrarApp(JSON.parse(usuario)); return; }
    }
    mostrarLogin();
  }
  return { login, registro, logout, mostrarLogin, mostrarRegistro, init };
})();

const App = (() => {
  const loaders = {
    catalogo:       () => Catalogo.load(),
    carrito:        () => Carrito.render(),
    misPedidos:     () => MisPedidos.load(),
    ayuda:          () => {},
    adminDashboard: () => AdminDashboard.load(),
    adminProductos: () => AdminProductos.load(),
    adminPedidos:   () => AdminPedidos.load(),
  };
  function ir(vista) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-'+vista);
    if (el) el.classList.add('active');
    document.querySelectorAll('.nav-link-js').forEach(b => b.classList.toggle('active', b.dataset.view===vista));
    if (loaders[vista]) loaders[vista]();
  }
  return { ir };
})();

document.addEventListener('DOMContentLoaded', () => { Carrito.init(); Auth.init(); });
