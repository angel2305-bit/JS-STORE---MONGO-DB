const Carrito = (() => {
  let items = [];
  function _guardar() { localStorage.setItem('carrito', JSON.stringify(items)); }
  function _cargar()  { items = JSON.parse(localStorage.getItem('carrito') || '[]'); }
  function _badge()   { document.getElementById('carritoBadge').textContent = items.reduce((s,i) => s+i.cantidad, 0); }

  function agregar(producto, talla) {
    const key = producto._id + '-' + talla;
    const existe = items.find(i => i.key === key);
    if (existe) { existe.cantidad++; }
    else { items.push({ key, productoId: producto._id, nombre: producto.nombre, categoria: producto.categoria, precio: producto.precio, talla, cantidad: 1 }); }
    _guardar(); _badge();
    Toast.ok(`${producto.nombre} (${talla}) agregado al carrito`);
  }

  function eliminar(key) { items = items.filter(i => i.key !== key); _guardar(); _badge(); render(); }

  function cambiarCantidad(key, delta) {
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) { eliminar(key); return; }
    _guardar(); _badge(); render();
  }

  function limpiar() { items = []; _guardar(); _badge(); }

  function render() {
    const cont = document.getElementById('carritoItems');
    const resumen = document.getElementById('carritoResumen');
    if (!items.length) {
      cont.innerHTML = '<p class="empty-state">🛒 Tu carrito está vacío</p>';
      resumen.style.display = 'none'; return;
    }
    resumen.style.display = 'block';
    let total = 0;
    cont.innerHTML = items.map(i => {
      total += i.precio * i.cantidad;
      return `<div class="carrito-item">
        <div class="carrito-item-img">${emojiCategoria(i.categoria)}</div>
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${i.nombre}</div>
          <div class="carrito-item-sub">Talla: ${i.talla}</div>
        </div>
        <div class="carrito-item-precio">${formatCOP(i.precio * i.cantidad)}</div>
        <div class="carrito-item-actions">
          <button class="qty-btn" onclick="Carrito.cambiarCantidad('${i.key}',-1)">−</button>
          <span class="qty-val">${i.cantidad}</span>
          <button class="qty-btn" onclick="Carrito.cambiarCantidad('${i.key}',1)">+</button>
          <button class="btn-js danger sm ms-2" onclick="Carrito.eliminar('${i.key}')">✕</button>
        </div>
      </div>`;
    }).join('');
    document.getElementById('resumenSubtotal').textContent = formatCOP(total);
    document.getElementById('resumenTotal').textContent    = formatCOP(total);
  }

  async function confirmarPedido() {
    const dir  = document.getElementById('direccionEntrega').value.trim();
    const nota = document.getElementById('notaPedido').value.trim();
    if (!items.length) return Toast.error('Tu carrito está vacío');
    if (!dir) return Toast.error('Ingresa la dirección de entrega');
    try {
      const total = items.reduce((s,i) => s + i.precio * i.cantidad, 0);
      await API.post('/api/pedidos', {
        items: items.map(i => ({ productoId: i.productoId, nombre: i.nombre, talla: i.talla, precio: i.precio, cantidad: i.cantidad })),
        total, direccionEntrega: dir, notas: nota
      });
      limpiar(); render();
      document.getElementById('direccionEntrega').value = '';
      document.getElementById('notaPedido').value = '';
      Toast.ok('¡Pedido realizado! Angel se pondrá en contacto contigo 🎉');
      setTimeout(() => App.ir('misPedidos'), 1500);
    } catch(e) { Toast.error(e.message); }
  }

  function init() { _cargar(); _badge(); }
  return { agregar, eliminar, cambiarCantidad, limpiar, render, confirmarPedido, init };
})();
