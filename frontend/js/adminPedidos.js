const AdminPedidos = (() => {
  let todos = []; let filtro = '';
  async function load() {
    const cont = document.getElementById('adminPedidosList');
    cont.innerHTML = '<div class="loading-state">Cargando pedidos...</div>';
    try { const res = await API.get('/api/pedidos'); todos = res.data; render(); }
    catch(e) { cont.innerHTML = '<div class="empty-state">Error cargando pedidos</div>'; }
  }
  function filtrarEstado(estado) { filtro = estado; render(); }
  function render() {
    const lista = filtro ? todos.filter(p=>p.estado===filtro) : todos;
    const cont = document.getElementById('adminPedidosList');
    if (!lista.length) { cont.innerHTML = '<div class="empty-state">No hay pedidos</div>'; return; }
    const estados = ['Pendiente','Confirmado','Enviado','Entregado','Cancelado'];
    cont.innerHTML = lista.map(p => `
      <div class="pedido-card">
        <div class="pedido-head">
          <div><div class="pedido-id">PEDIDO #${p._id.slice(-6).toUpperCase()}</div><div class="pedido-fecha">${formatFecha(p.createdAt)}</div></div>
          <span class="badge-estado estado-${p.estado}">${p.estado}</span>
        </div>
        <div class="pedido-cliente">👤 ${p.clienteNombre} — ${p.clienteEmail}</div>
        <div class="pedido-items">${p.items.map(i=>`${i.nombre} (${i.talla}) x${i.cantidad}`).join('<br>')}</div>
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="pedido-total">${formatCOP(p.total)}</div>
            <div class="pedido-dir">📍 ${p.direccionEntrega}</div>
            ${p.notas?`<div class="pedido-dir">📝 ${p.notas}</div>`:''}
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
            ${estados.filter(e=>e!==p.estado).map(e=>`<button class="btn-js btn-js-outline sm" onclick="AdminPedidos.cambiarEstado('${p._id}','${e}')">${e}</button>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }
  async function cambiarEstado(id, estado) {
    try { await API.put(`/api/pedidos/${id}/estado`, { estado }); Toast.ok(`Pedido actualizado a: ${estado}`); load(); }
    catch(e) { Toast.error(e.message); }
  }
  return { load, filtrarEstado, cambiarEstado };
})();
