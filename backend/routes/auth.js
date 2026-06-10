const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { Usuario } = require('../database');
const { CLAVE }   = require('../middleware/auth');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
  const usuario = await Usuario.findOne({ email });
  if (!usuario || usuario.password !== password)
    return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
  if (!usuario.activo)
    return res.status(401).json({ success: false, message: 'Cuenta desactivada' });
  const token = jwt.sign(
    { id: usuario._id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    CLAVE, { expiresIn: '8h' }
  );
  res.json({ success: true, message: `Bienvenido ${usuario.nombre}!`, token,
    usuario: { id: usuario._id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol, telefono: usuario.telefono }
  });
});

router.post('/registro', async (req, res) => {
  const { nombre, apellido, email, password, telefono } = req.body;
  if (!nombre || !email || !password)
    return res.status(400).json({ success: false, message: 'Nombre, email y contraseña son obligatorios' });
  const existe = await Usuario.findOne({ email });
  if (existe)
    return res.status(400).json({ success: false, message: 'Ya existe una cuenta con ese email' });
  const nuevo = await Usuario.create({ nombre, apellido: apellido||'', email, password, telefono: telefono||'', rol: 'cliente' });
  const token = jwt.sign(
    { id: nuevo._id, email: nuevo.email, nombre: nuevo.nombre, rol: nuevo.rol },
    CLAVE, { expiresIn: '8h' }
  );
  res.status(201).json({ success: true, message: 'Cuenta creada!', token,
    usuario: { id: nuevo._id, nombre: nuevo.nombre, apellido: nuevo.apellido, email: nuevo.email, rol: nuevo.rol }
  });
});

router.get('/verificar', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.json({ success: false });
  try {
    res.json({ success: true, usuario: jwt.verify(token, CLAVE) });
  } catch {
    res.json({ success: false });
  }
});

module.exports = router;
