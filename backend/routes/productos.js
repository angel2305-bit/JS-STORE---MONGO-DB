const router   = require('express').Router();
const { Producto } = require('../database');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.get('/', verificarToken, async (req, res) => {
  const filtro = req.usuario.rol === 'cliente' ? { activo: true } : {};
  const productos = await Producto.find(filtro);
  res.json({ success: true, total: productos.length, data: productos });
});

router.get('/:id', verificarToken, async (req, res) => {
  const p = await Producto.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.json({ success: true, data: p });
});

router.post('/', verificarToken, soloAdmin, async (req, res) => {
  const { nombre, descripcion, categoria, precio, tallas, stock } = req.body;
  if (!nombre || !precio || !categoria)
    return res.status(400).json({ success: false, message: 'Nombre, precio y categoria son obligatorios' });
  const nuevo = await Producto.create({ nombre, descripcion: descripcion||'', categoria, precio, tallas: tallas||[], stock: stock||0 });
  res.status(201).json({ success: true, message: 'Producto creado', data: nuevo });
});

router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
  const p = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.json({ success: true, message: 'Producto actualizado', data: p });
});

router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  const p = await Producto.findByIdAndDelete(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
  res.json({ success: true, message: 'Producto eliminado' });
});

module.exports = router;
