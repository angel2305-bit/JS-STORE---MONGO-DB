const jwt = require('jsonwebtoken');
const CLAVE = process.env.JWT_SECRET || 'jsstore_clave_secreta_2024';

function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Debes iniciar sesion primero' });
  try {
    req.usuario = jwt.verify(token, CLAVE);
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Sesion expirada, inicia sesion nuevamente' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin')
    return res.status(403).json({ success: false, message: 'Acceso solo para administradores' });
  next();
}

module.exports = { verificarToken, soloAdmin, CLAVE };
