/**
 * Rutas del administrador
 * agrupa todas las rutas de gestion del admin
 */


const express = require ('express');
const router = express.Router();

// importar los middlewares

const { verificarAuth } = require ('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar, soloAdministrador } = require ('../middleware/checkRole');

// importar configuracion de multer para la subida de imagenes

const { upload } = require ('../config/multer');

//importar controladores

const categoriaController = require ('../controllers/categoria.controller');
const subcategoriaController = require ('../controllers/subcategoria.controller');
const productoController = require ('../controllers/producto.controller');
const usuarioController = require ('../controllers/usuario.controller');
const pedidoController = require ('../controllers/pedido.controller');

// restricciones
router.use(verificarAuth, esAdminOAuxiliar);

//Rutas de categorias
// get /api/admin/categorias
router.get('/categorias', categoriaController.getCategorias);

// get /api/admin/categorias
router.get('/categorias/:id', categoriaController.getCategoriasById);

// get /api/admin/categorias/:id/stats
router.get('/categorias:id/stats', categoriaController.getEstadisticasCategoria);

// POST /api/admin/categorias
router.post('/categorias', categoriaController.crearCategoria);

// PUT /api/admin/categorias
router.put('/categorias', categoriaController.actualizarCategoria);

// patch /api/admin/categorias:id / toggle desactivar o activar categoria
router.patch('/categorias', categoriaController.toggleCategoria);

// delete /api/admin/categorias
router.get('/categorias/:id', categoriaController.eliminarCategoria);




/**************************************************************** */



//Rutas de subcategorias
// get /api/admin/subcategorias
router.get('/subcategorias', subcategoriaController.getSubcategorias);

// get /api/admin/subcategorias
router.get('/subcategorias/:id', subcategoriaController.getSubcategoriaById);

// get /api/admin/subcategorias/:id/stats
router.get('/subcategorias:id/stats', subcategoriaController.getEstadisticasSubcategoria);

// POST /api/admin/subcategorias
router.post('/subcategorias', subcategoriaController.crearSubcategoria);

// PUT /api/admin/subcategorias
router.put('/subcategorias', subcategoriaController.actualizarSubcategoria);

// patch /api/admin/subcategorias:id / toggle desactivar o activar categoria
router.patch('/subcategorias', subcategoriaController.toggleSubcategoria);

// delete /api/admin/subcategorias
router.get('/subcategorias/:id', subcategoriaController.eliminarSubcategoria);



/******************************************************************* */


//Rutas de producto
// get /api/admin/producto
router.get('/productos', productoController.getProductos);

// get /api/admin/producto
router.get('/productos/:id', productoController.getProductoById);

// get /api/admin/producto/:id/stats
//router.get('/productos:id/stats', productoController.getEstadisticasProducto);

// POST /api/admin/producto
router.post('/productos', productoController.crearProducto);

// PUT /api/admin/producto
router.put('/productos', productoController.actualizarProducto);

// patch /api/admin/producto:id / stock
router.patch('/productos', productoController.toggleProducto);

// delete /api/admin/productos/:id
router.get('/productos/:id', productoController.eliminarProducto);



/************************************************************************************** */

//Rutas de usuario
// get /api/admin/usuario
router.get('/usuarios', usuarioController.getUsuarios);

// get /api/admin/usuario
router.get('/usuarios/:id', usuarioController.getUsuariosById);

// get /api/admin/usuario/:id/stats
router.get('/usuarios:id/stats', usuarioController.getEstadisticasUsuario);

// POST /api/admin/usuario
router.post('/usuarios', usuarioController.crearUsuario);

// PUT /api/admin/usuario
router.put('/usuarios/:id', usuarioController.actualizarUsuario);

// patch /api/admin/usuario:id / toggle desactivar o activar usuario
router.patch('/usuarios/:id/toggle', usuarioController.toggleUsuario);

// delete /api/admin/usuario
router.get('/usuarios/:id', usuarioController.eliminarUsuario);


/*************************************************** */

//rutas de pedidos
// get /api/admin/pedido
router.get('/pedido', pedidoController.getAllPedidos);

// get /api/admin/pedido
router.get('/pedido/:id', pedidoController.actualizarEstadoPedido);

// get /api/admin/pedido/:id/stats
router.get('/pedido:id/stats', pedidoController.getEstadisticasPedidos);

// POST /api/admin/pedido
router.post('/pedido', pedidoController.crearPedido);

// PUT /api/admin/pedido
router.put('/pedido', pedidoController.getMisPedidos);

// patch /api/admin/pedido:id / stock
router.patch('/pedido', pedidoController.getPedidoById);

// delete /api/admin/pedido/:id
router.get('/pedido/:id', pedidoController.cancelarPedido);

module.exports = router;