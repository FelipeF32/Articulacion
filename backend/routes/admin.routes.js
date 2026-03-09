/**
 * rutas del administrador
 * agrupa todas las rutas de gestion del admin
 */

const express = require('express');
const router = express.Router();

// importar los middleware
const { verificarAuth } = require('../middleware/auth');
const { esAdministrador, esAdminOAuxiliar, soloAministrador } = require ('../middleware/checkRole');

//importar configuracion de multer para la subida de imagenes
const { upload } = require('../config/multer');

//importar controladores
const categoriaController = require('../controllers/categoria.controller');
const subcategoriaController = require('../controllers/subcategoria.controller');
const productoController = require('../controllers/producto.controller')
const usuarioController = require('../controllers/usuario.controller');
const pedidoController = require('../controllers/pedido.controller');



//restricciones de acceso a las rutas del admin
router.use(verificarAuth, esAdminOAuxiliar);

//rutas de categoria


//get /api/admin/categoria
router.get('/categorias', categoriaController.getCategorias);

//get /api/admin/categoria
router.get('/categorias', categoriaController.getCategoriasById);

//get /api/admin/categoria/:id/stats
router.get('/categorias:id/stats', categoriaController.getEstadisticasCategoria);

//POST /api/admin/categoria
router.post('/categorias', categoriaController.crearCategoria);

//PUT/api/admin/categoria
router.put('/categorias/:id', categoriaController.actualizarCategoria);

//patch /api/admin/categoria
router.patch('/categorias', categoriaController.toggleCategoria);

//delete /api/admin/categoria
router.get('/categorias/:id', categoriaController.eliminarCategoria);


/************************************************************************** */


// rutas de subcategoria


//get /api/admin/categoria
router.get('/subcategoria', categoriaController.getCategorias);

//get /api/admin/categoria
router.get('/categorias', categoriaController.getCategoriasById);

//get /api/admin/categoria/:id/stats
router.get('/categorias:id/stats', categoriaController.getEstadisticasCategoria);

//POST /api/admin/categoria
router.post('/categorias', categoriaController.crearCategoria);

//PUT/api/admin/categoria
router.put('/categorias/:id', categoriaController.actualizarCategoria);

//patch /api/admin/categoria
router.patch('/categorias', categoriaController.toggleCategoria);

//delete /api/admin/categoria
router.get('/categorias/:id', categoriaController.eliminarCategoria);





