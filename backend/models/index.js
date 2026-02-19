/**
 * Asociacines entre modelos
 * este archivo se define todas las relaciones entre los modelos sequelize
 * deje ejecutarse despues de importar los modelos
 */

//Importar modelos
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');
const Producto = require('./Producto');
const Carrito = require('./Carrito');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
const { on } = require('node:cluster');


/**
 * Definir relaciones entre modelos
 * Tipos de relaciones sequelize:
 * hasOne: 1 a 1
 * belongsTo: 1 a 1 
 * hasMany: 1 a muchos 1-N
 * belongsToMany: muchos a muchos N-N
 */

/**
 * Categoria - Subcategoria
 * Una categoria tiene muchas subcategorias
 * Una subcategoria pertenece a una categoria
 */

Categoria.hasMany(Subcategoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'subcategorias', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una categoria se eliminan sus subcategorias
    onUpdate: 'CASCADE' // Si se actualiza categoria se actualizan sus subcategorias
});
Subcategoria.belongsTo(Categoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'categoria', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una categoria se elimina su subcategoria
    onUpdate: 'CASCADE' // Si se actualiza categoria se actualizan sus subcategorias
});


/**
 * Cateoria - Producto
 * Una categoria tiene muchos productos
 * Un producto pertenece a una categoria
 */

Categoria.hasMany(Producto, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'productos', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una categoria se elimina el producto
    onUpdate: 'CASCADE' // Si se actualiza categoria se actualiza el producto
});
Producto.belongsTo(Categoria, {
    foreignKey: 'categoriaId', // Campo que conecta las tablas
    as: 'categoria', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una categoria se elimina el producto
    onUpdate: 'CASCADE' // Si se actualiza categoria se actualiza el producto
});

/**
 * Subcategoria y producto
 * Una subcategoria tiene muchos productos
 * Un producto pertenece a una subcategoria
 */

Subcategoria.hasMany(Producto, {
    foreignKey: 'subcategoriaId', // Campo que conecta las tablas
    as: 'productos', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una subcategoria se eliminan sus productos
    onUpdate: 'CASCADE' // Si se actualiza subcategoria se actualizan sus productos
});
Producto.belongsTo(Subcategoria, {
    foreignKey: 'subcategoriaId', // Campo que conecta las tablas
    as: 'subcategoria', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina una subcategoria se elimina su producto
    onUpdate: 'CASCADE' // Si se actualiza subcategoria se actualizan sus productos
});

/**
 * Usuario - Carrito
 * Un usuario tiene muchos carritos
 * Un carrito pertenece a un usuario
 */


Usuario.hasMany(Carrito, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'carrito', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un usuario se elimina su carrito
    onUpdate: 'CASCADE' // Si se actualiza usuario se actualiza su carrito
});
Carrito.belongsTo(Usuario, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'usuario', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un usuario se elimina su carrito
    onUpdate: 'CASCADE' // Si se actualiza usuario se actualiza su carrito
});
/**
 * Producto - Carrito
 * Un producto puede estar en muchos carritos
 * Un carrito puede tener muchos productos
 */


Producto.hasMany(Carrito, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'carrito', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un producto se eliminan sus carritos
    onUpdate: 'CASCADE' // Si se actualiza producto se actualizan sus carritos
});
Carrito.belongsTo(Producto, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'producto', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un producto se elimina su carrito
    onUpdate: 'CASCADE' // Si se actualiza producto se actualiza su carrito
});

/**
 * Usuario - Pedido
 * Un usuario tiene muchos pedidos
 * Un pedido pertenece a un usuario
 */



Usuario.hasMany(Pedido, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'pedidos', // Alias para la relación
    onDelete: 'RESTRICT', // Si se elimina un usuario no se eliminan sus pedidos
    onUpdate: 'CASCADE' // Si se actualiza usuario se actualizan sus pedidos
});
Pedido.belongsTo(Usuario, {
    foreignKey: 'usuarioId', // Campo que conecta las tablas
    as: 'usuario', // Alias para la relación
    onDelete: 'RESTRICT', // Si se elimina un usuario no se elmininan sus pedidos
    onUpdate: 'CASCADE' // Si se actualiza usuario se actualiza su pedido
});

/**
 * Pedido - DetallePedido
 * Un pedido tiene muchos detalles de pedido
 * Un detalle de pedido pertenece a un pedido
 */

Pedido.hasMany(DetallePedido, {
    foreignKey: 'PedidoId', // Campo que conecta las tablas
    as: 'detalles', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un pedido se eliminan sus detalles de pedido
    onUpdate: 'CASCADE' // Si se actualiza un pedido se actualizan sus detalles de pedido
});
DetallePedido.belongsTo(Pedido, {
    foreignKey: 'PedidoId', // Campo que conecta las tablas
    as: 'pedido', // Alias para la relación
    onDelete: 'CASCADE', // Si se elimina un pedido se elimina su detalle de pedido
    onUpdate: 'CASCADE' // Si se actualiza un pedido se actualiza su detalle de pedido
});


/**
 * Producto - DetallePedido
 * Un producto puede estar en muchos detalles de pedido
 * Un detalle de pedido pertenece a un producto
 */

Producto.hasMany(DetallePedido, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'detalles', // Alias para la relación
    onDelete: 'RESTRICT', // No se puede eliminar un producto si esta en un detalle de pedido
    onUpdate: 'CASCADE' // Si se actualiza producto se actualizan sus detalles de pedido
});
DetallePedido.belongsTo(Producto, {
    foreignKey: 'productoId', // Campo que conecta las tablas
    as: 'producto', // Alias para la relación
    onDelete: 'RESTRICT', // No se puede eliminar un producto si esta en un detalle de pedido
    onUpdate: 'CASCADE' // Si se actualiza producto se actualiza su detalle de pedido
});

/**
 * Relacion muchos a muchos
 * Pedido y producto tiene una relacion muchos a muchos a traves de DetallePedido
 */

/**
 * Pedido - Producto
 * Una categoria tiene muchas subcategorias
 * Una subcategoria pertenece a una categoria
 */

Pedido.hasMany(Producto, {
    through: DetallePedido, // tabla intyermedia que conecta las tablas
    foreignKey: 'pedidoId', // Campo que conecta las tablas
    otherKey: 'productoId', // Campo que conecta las tablas
    as: 'productos', // Alias para la relación
});
Producto.hasMany(Pedido, {
    through: DetallePedido, // Campo que conecta las tablas
    foreignKey: 'productoId', // Campo que conecta las tablas
    otherKey: 'pedidoId', // Campo que conecta las tablas
    as: 'pedidos', // Alias para la relación
});

/**
 * Exportar funcion de inicializacion 
 * funcion para inicializar todas las asiociaciones
 * se llama desde server.js despues de carar los modelos
 */

const inAssociations = () => {
    console.log('Asociaciones entre los modelos establecidas correctamente');
};

//Exportar los modelos
module.exports = {
    Usuario,
    Categoria,
    Subcategoria,
    Producto,
    Carrito,
    Pedido,
    DetallePedido,
    inAssociations
};

