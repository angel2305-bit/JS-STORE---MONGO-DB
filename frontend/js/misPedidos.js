const MisPedidos = (() => {
  async function load() {
    const cont = document.getElementById('misPedidosList');
    cont.innerHTML = '<div class="loading-state">Cargando tus pedidos...</div>';
    try {
      const res = await API.get('/api/pedidos');
      if (!res.data.length) { cont.innerHTML = '<div class="empty-state">Aún no has hecho ningún pedido 🛒</div>'; return; }
      cont.innerHTML = res.data.map(p => {
        const itemsTexto = p.items.map(i => `${i.nombre} (${i.talla}) x${i.cantidad}`).join('<br>');
        return `<div class="pedido-card">
          <div class="pedido-head">
            <div><div class="pedido-id">PEDIDO #${p._id.slice(-6).toUpperCase()}</div><div class="pedido-fecha">${formatFecha(p.createdAt)}</div></div>
            <span class="badge-estado estado-${p.estado}">${p.estado}</span>
          </div>
          <div class="pedido-items">${itemsTexto}</div>
          <div class="d-flex justify-content-between align-items-center">
            <div class="pedido-total">${formatCOP(p.total)}</div>
            <div class="pedido-dir">📍 ${p.direccionEntrega}</div>
          </div>
          ${p.notas?`<div class="pedido-dir mt-1">📝 ${p.notas}</div>`:''}
        </div>`;
      }).join('');
    } catch(e) { cont.innerHTML = '<div class="empty-state">Error cargando pedidos</div>'; }
  }
  return { load };
})();
