const router = require('express').Router();
const { Pedido, Producto } = require('../database');
const { verificarToken, soloAdmin } = require('../middleware/auth');

router.get('/stats', verificarToken, soloAdmin, async (req, res) => {
  const pedidos   = await Pedido.find();
  const productos = await Producto.countDocuments({ activo: true });
  const { Usuario } = require('../database');
  const clientes  = await Usuario.countDocuments({ rol: 'cliente' });
  const ingresos  = pedidos.filter(p => p.estado !== 'Cancelado').reduce((s,p) => s + p.total, 0);
  res.json({ success: true, data: {
    totalProductos: productos, totalPedidos: pedidos.length,
    pedidosPendientes: pedidos.filter(p => p.estado === 'Pendiente').length,
    pedidosEntregados: pedidos.filter(p => p.estado === 'Entregado').length,
    totalIngresos: ingresos, totalClientes: clientes
  }});
});

router.get('/', verificarToken, async (req, res) => {
  const filtro = req.usuario.rol === 'admin' ? {} : { clienteId: req.usuario.id };
  const pedidos = await Pedido.find(filtro).sort({ createdAt: -1 });
  res.json({ success: true, total: pedidos.length, data: pedidos });
});

router.post('/', verificarToken, async (req, res) => {
  const { items, direccionEntrega, notas } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'El pedido no tiene productos' });
  if (!direccionEntrega) return res.status(400).json({ success: false, message: 'La direccion de entrega es obligatoria' });
  const total = items.reduce((s,i) => s + (i.precio * i.cantidad), 0);
  const pedido = await Pedido.create({
    clienteId: req.usuario.id, clienteNombre: req.usuario.nombre,
    clienteEmail: req.usuario.email, items, total, direccionEntrega, notas: notas||''
  });
  res.status(201).json({ success: true, message: 'Pedido realizado!', data: pedido });
});

router.put('/:id/estado', verificarToken, soloAdmin, async (req, res) => {
  const { estado } = req.body;
  const estados = ['Pendiente','Confirmado','Enviado','Entregado','Cancelado'];
  if (!estados.includes(estado))
    return res.status(400).json({ success: false, message: 'Estado invalido' });
  const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado }, { new: true });
  if (!pedido) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
  res.json({ success: true, message: `Pedido actualizado a: ${estado}`, data: pedido });
});

module.exports = router;
