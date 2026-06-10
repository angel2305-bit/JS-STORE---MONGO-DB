/**
 * database.js
 * Conexion a MongoDB Atlas con Mongoose
 * Angel De La Rosa - GA4-220501096-AA1-EV02
 */
const mongoose = require('mongoose');

// Esquema de Usuarios
const usuarioSchema = new mongoose.Schema({
  nombre:    { type: String, required: true },
  apellido:  { type: String, default: '' },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  rol:       { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  telefono:  { type: String, default: '' },
  activo:    { type: Boolean, default: true }
}, { timestamps: true });

// Esquema de Productos
const productoSchema = new mongoose.Schema({
  nombre:      { type: String, required: true },
  descripcion: { type: String, default: '' },
  categoria:   { type: String, required: true },
  precio:      { type: Number, required: true },
  tallas:      { type: [String], default: [] },
  stock:       { type: Number, default: 0 },
  imagen:      { type: String, default: '' },
  activo:      { type: Boolean, default: true }
}, { timestamps: true });

// Esquema de Pedidos
const pedidoSchema = new mongoose.Schema({
  clienteId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  clienteNombre:    { type: String },
  clienteEmail:     { type: String },
  items: [{
    productoId: mongoose.Schema.Types.ObjectId,
    nombre:     String,
    talla:      String,
    precio:     Number,
    cantidad:   Number
  }],
  total:            { type: Number, required: true },
  direccionEntrega: { type: String, required: true },
  notas:            { type: String, default: '' },
  estado:           { type: String, enum: ['Pendiente','Confirmado','Enviado','Entregado','Cancelado'], default: 'Pendiente' }
}, { timestamps: true });

const Usuario  = mongoose.model('Usuario',  usuarioSchema);
const Producto = mongoose.model('Producto', productoSchema);
const Pedido   = mongoose.model('Pedido',   pedidoSchema);

// Conectar a MongoDB y crear datos iniciales si no existen
async function conectar() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://angeladmin:jsstore2024@cluster0.erdd61y.mongodb.net/jsstore?appName=Cluster0';
await mongoose.connect(uri);
  console.log('✅ Conectado a MongoDB Atlas');
  await _crearDatosIniciales();
}

async function _crearDatosIniciales() {
  // Solo crea el admin si no existe
  const adminExiste = await Usuario.findOne({ rol: 'admin' });
  if (!adminExiste) {
    await Usuario.create({
      nombre: 'Angel', apellido: 'De la Rosa',
      email: 'Angel@jsstore.com', password: 'jsstore',
      rol: 'admin', telefono: '3009985444'
    });
    console.log('👤 Admin creado');
  }

  // Solo crea productos si no hay ninguno
  const productosExisten = await Producto.countDocuments();
  if (productosExisten === 0) {
    await Producto.insertMany([
      { nombre: 'Camisas Junior de Barranquilla', descripcion: 'Camisas retro del Junior de Barranquilla, disponibles en versión local e visitante.', categoria: 'Camisas', precio: 85000, tallas: ['S','M','L','XL'], stock: 50, imagen: 'camisas_junior.png' },
      { nombre: 'Hoodie JS Exclusivo', descripcion: 'Sudadera hoodie exclusiva con el logo JS bordado. Tela gruesa y abrigada.', categoria: 'Hoodies', precio: 120000, tallas: ['S','M','L','XL','XXL'], stock: 15, imagen: 'hoodie_js.png' },
      { nombre: 'Jean Amiri Rotos', descripcion: 'Jean estilo Amiri con rotos y detalles bordados, corte slim fit.', categoria: 'Jeans', precio: 145000, tallas: ['28','30','32','34','36'], stock: 12, imagen: 'jean_amiri.png' },
      { nombre: 'Chancletas Tommy Hilfiger', descripcion: 'Chancletas Tommy Hilfiger originales, disponibles en varios colores.', categoria: 'Calzado', precio: 95000, tallas: ['38','39','40','41','42','43','44'], stock: 25, imagen: 'chancletas_tommy.png' }
    ]);
    console.log('📦 Productos iniciales creados');
  }
}

module.exports = { conectar, Usuario, Producto, Pedido };
