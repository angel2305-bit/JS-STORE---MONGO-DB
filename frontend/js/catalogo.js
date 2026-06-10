const Catalogo = (() => {
  let productos = [];
  let categoriaActiva = 'Todos';

  async function load() {
    document.getElementById('productosGrid').innerHTML = '<div class="loading-state">Cargando productos...</div>';
    try {
      const res = await API.get('/api/productos');
      productos = res.data;
      _renderFiltros(); renderProductos();
    } catch(e) { Toast.error('Error cargando productos'); }
  }

  function _renderFiltros() {
    const cats = ['Todos', ...new Set(productos.map(p => p.categoria))];
    document.getElementById('categoriasFilter').innerHTML = cats.map(c =>
      `<button class="cat-btn ${c===categoriaActiva?'active':''}" onclick="Catalogo.filtrar('${c}')">${c}</button>`
    ).join('');
  }

  function filtrar(cat) { categoriaActiva = cat; _renderFiltros(); renderProductos(); }

  function _imgHtml(p, alto=200) {
    if (p.imagen) return `<img src="/img/${p.imagen}" alt="${p.nombre}" style="width:100%;height:${alto}px;object-fit:cover" onerror="this.parentElement.innerHTML='<div style=\\'font-size:3rem;display:flex;align-items:center;justify-content:center;height:${alto}px\\'>${emojiCategoria(p.categoria)}</div>'"/>`;
    return `<div style="font-size:3.5rem;display:flex;align-items:center;justify-content:center;height:${alto}px">${emojiCategoria(p.categoria)}</div>`;
  }

  function renderProductos() {
    const filtrados = categoriaActiva==='Todos' ? productos : productos.filter(p => p.categoria===categoriaActiva);
    if (!filtrados.length) { document.getElementById('productosGrid').innerHTML = '<div class="empty-state">No hay productos en esta categoría</div>'; return; }
    document.getElementById('productosGrid').innerHTML = filtrados.map(p => `
      <div class="producto-card" onclick="Catalogo.verDetalle('${p._id}')">
        <div class="producto-img" style="padding:0;overflow:hidden;border-radius:12px 12px 0 0">${_imgHtml(p,200)}</div>
        <div class="producto-body">
          <div class="producto-cat">${p.categoria}</div>
          <div class="producto-nombre">${p.nombre}</div>
          <div class="producto-precio">${formatCOP(p.precio)}</div>
          <div class="producto-stock">${p.stock>0?`${p.stock} disponibles`:'⚠️ Sin stock'}</div>
        </div>
        <div class="producto-actions">
          <button class="btn-js btn-js-primary w-100" onclick="event.stopPropagation();Catalogo.verDetalle('${p._id}')">VER Y AGREGAR</button>
        </div>
      </div>`).join('');
  }

  function verDetalle(id) {
    const p = productos.find(x => x._id===id); if (!p) return;
    window._tallaSeleccionada = null;
    Modal.abrir(p.nombre, `
      <div style="overflow:hidden;border-radius:10px;margin-bottom:1rem;max-height:260px">${_imgHtml(p,260)}</div>
      <div class="detalle-cat">${p.categoria}</div>
      <h4 style="font-family:'Barlow Condensed';font-size:1.5rem;font-weight:700;margin-bottom:0.5rem">${p.nombre}</h4>
      <p style="color:var(--muted);font-size:0.9rem;margin-bottom:0.75rem">${p.descripcion}</p>
      <div class="detalle-precio">${formatCOP(p.precio)}</div>
      <p style="font-size:0.8rem;color:var(--muted);margin:0.25rem 0 0.75rem">Stock: ${p.stock} unidades</p>
      <label class="form-label-custom">Selecciona tu talla</label>
      <div class="tallas-grid">${p.tallas.map(t=>`<button class="talla-btn" onclick="Catalogo._selectTalla('${t}',this)">${t}</button>`).join('')}</div>
      <button class="btn-js btn-js-primary w-100 mt-3" onclick="Catalogo._agregarAlCarrito('${p._id}')">🛒 AGREGAR AL CARRITO</button>`);
  }

  function _selectTalla(talla, btn) {
    document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected'); window._tallaSeleccionada = talla;
  }

  function _agregarAlCarrito(id) {
    const talla = window._tallaSeleccionada;
    if (!talla) return Toast.error('Selecciona una talla primero');
    const p = productos.find(x => x._id===id); if (!p) return;
    Carrito.agregar(p, talla); window._tallaSeleccionada = null; Modal.cerrar();
  }

  return { load, filtrar, verDetalle, _selectTalla, _agregarAlCarrito };
})();
