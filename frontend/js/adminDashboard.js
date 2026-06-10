const AdminDashboard = (() => {
  async function load() {
    try {
      const [statsRes, pedidosRes] = await Promise.all([API.get('/api/pedidos/stats'), API.get('/api/pedidos')]);
      const s = statsRes.data;
      document.getElementById('st-productos').textContent  = s.totalProductos;
      document.getElementById('st-pedidos').textContent    = s.totalPedidos;
      document.getElementById('st-pendientes').textContent = s.pedidosPendientes;
      document.getElementById('st-entregados').textContent = s.pedidosEntregados;
      document.getElementById('st-ingresos').textContent   = formatCOP(s.totalIngresos);
      document.getElementById('st-clientes').textContent   = s.totalClientes;
      const ultimos = pedidosRes.data.slice(0,5);
      document.getElementById('ultimosPedidos').innerHTML = ultimos.length
        ? `<table class="tabla-js"><thead><tr><th>#</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>
            ${ultimos.map(p=>`<tr>
              <td><strong>#${p._id.slice(-6).toUpperCase()}</strong></td>
              <td>${p.clienteNombre}</td>
              <td style="color:var(--rojo);font-family:'Bebas Neue';font-size:1.1rem">${formatCOP(p.total)}</td>
              <td><span class="badge-estado estado-${p.estado}">${p.estado}</span></td>
              <td style="color:var(--muted)">${formatFecha(p.createdAt)}</td>
            </tr>`).join('')}
          </tbody></table>`
        : '<p class="empty-state">Aún no hay pedidos</p>';
    } catch(e) { Toast.error('Error cargando estadísticas'); }
  }
  return { load };
})();
