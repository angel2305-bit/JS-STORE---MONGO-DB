const AdminProductos = (() => {
  let productos = [];
  async function load() {
    try { const res = await API.get('/api/productos'); productos = res.data; _renderTabla(); }
    catch(e) { Toast.error('Error cargando productos'); }
  }
  function _renderTabla() {
    document.getElementById('tablaProductosBody').innerHTML = productos.map(p => `
      <tr>
        <td>${p.imagen?`<img src="/img/${p.imagen}" style="width:50px;height:50px;object-fit:cover;border-radius:6px"/>`:`<span style="font-size:1.5rem">${emojiCategoria(p.categoria)}</span>`}</td>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.categoria}</td>
        <td style="color:var(--rojo);font-family:'Bebas Neue';font-size:1.1rem">${formatCOP(p.precio)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn-js btn-js-outline sm me-1" onclick="AdminProductos.editar('${p._id}')">Editar</button>
          <button class="btn-js danger sm" onclick="AdminProductos.eliminar('${p._id}')">Eliminar</button>
        </td>
      </tr>`).join('');
  }
  function _formHtml(p) {
    const cats = ['Camisas','Jeans','Hoodies','Calzado','Gorras','General'];
    return `
      <div class="mb-3"><label class="form-label-custom">Nombre *</label><input type="text" id="pNombre" class="input-custom" value="${p?p.nombre:''}" placeholder="Ej: Camisa Junior"/></div>
      <div class="mb-3"><label class="form-label-custom">Descripción</label><textarea id="pDesc" class="input-custom" rows="2">${p?p.descripcion:''}</textarea></div>
      <div class="row g-2 mb-3">
        <div class="col-6"><label class="form-label-custom">Categoría *</label><select id="pCat" class="input-custom">${cats.map(c=>`<option ${p&&p.categoria===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="col-6"><label class="form-label-custom">Precio (COP) *</label><input type="number" id="pPrecio" class="input-custom" value="${p?p.precio:''}" placeholder="85000"/></div>
      </div>
      <div class="row g-2 mb-3">
        <div class="col-6"><label class="form-label-custom">Stock</label><input type="number" id="pStock" class="input-custom" value="${p?p.stock:0}"/></div>
        <div class="col-6"><label class="form-label-custom">Tallas (separadas por coma)</label><input type="text" id="pTallas" class="input-custom" value="${p?p.tallas.join(','):''}" placeholder="S,M,L,XL"/></div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn-js btn-js-primary flex-fill" onclick="AdminProductos._guardar('${p?p._id:'null'}')">${p?'GUARDAR CAMBIOS':'CREAR PRODUCTO'}</button>
        <button class="btn-js btn-js-ghost" onclick="Modal.cerrar()">CANCELAR</button>
      </div>`;
  }
  function abrirFormNuevo() { Modal.abrir('NUEVO PRODUCTO', _formHtml(null)); }
  function editar(id) { const p=productos.find(x=>x._id===id); if(p) Modal.abrir('EDITAR PRODUCTO',_formHtml(p)); }
  async function _guardar(id) {
    const datos = { nombre: document.getElementById('pNombre').value.trim(), descripcion: document.getElementById('pDesc').value.trim(), categoria: document.getElementById('pCat').value, precio: parseFloat(document.getElementById('pPrecio').value), stock: parseInt(document.getElementById('pStock').value)||0, tallas: document.getElementById('pTallas').value.split(',').map(t=>t.trim()).filter(Boolean) };
    if (!datos.nombre||!datos.precio) return Toast.error('Nombre y precio son obligatorios');
    try {
      id==='null' ? await API.post('/api/productos', datos) : await API.put('/api/productos/'+id, datos);
      Toast.ok(id==='null'?'Producto creado':'Producto actualizado');
      Modal.cerrar(); load();
    } catch(e) { Toast.error(e.message); }
  }
  async function eliminar(id) {
    const p=productos.find(x=>x._id===id);
    if (!confirm(`¿Eliminar "${p?.nombre}"?`)) return;
    try { await API.delete('/api/productos/'+id); Toast.ok('Producto eliminado'); load(); }
    catch(e) { Toast.error(e.message); }
  }
  return { load, abrirFormNuevo, editar, _guardar, eliminar };
})();
