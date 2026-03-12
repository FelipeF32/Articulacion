/**
 * controlador de Producto
 * maneja las operaciones crud y activar y desactivar subcategorias
 * solo accesible por admins
 */

/**
 * importar modelos
 */

const Subcategoria = require('../models/Subcategoria');
const Categoria = require('../models/Categoria');
const Producto = require('../models/Producto');

//Importar path y fs para manejo de imagenes
const path = require('path');
const fs = require('fs');


/**
 * obtener todos los productos
 * query params:
 * categoriaId: Id de la categoria para filtrar por categoria
 * subcategoriaId: Id de la subcategoria para filtrar por subcategoria
 * activo true/false (filtrar por estado activo/inactivo)
 * 
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductos = async (req, res) => {
    try {
        const {categoriaId,
            subcategoriaId, 
            activo,
            conStock,
            buscar,
            pagina = 1,
            limite = 100
            } = req.query;

            //Construir filtros
        const where = {};
        if (categoriaId) where.categoriaId = categoriaId;
        if (subcategoriaId) where.subcategoriaId =
        subcategoriaId;
        if (activo !== undefined) where.activo = activo === 'true';
        if (conStock === 'true') where.stock = {[require('sequelize').Op.gt]: 0};


        if (buscar) {
            const {Op} = require('sequelize');
            //Op.or busca por nombre o descripcion
            //Op.like equivale a un like en sql con comodines para buscar coincidencias parciales
            where[Op.or] = [
                {nombre: {[Op.like]: `%${buscar}%`}},
                {descripcion: {[Op.like]: `%${buscar}%`}}
            ];
        }

        //paginacion
        const offset = (parseInt(pagina) -1) * parseInt(limite);




        //opciones de consulta
        const opciones = {
            where,
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
                include: [
                {
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['id', 'nombre']
                }
            ],
            limit: parseInt(limite),
            offset,
            order: [['nombre', 'ASC']]
        
        };

        //obtener productos y total
        const {count, rows: productos } = await Producto.findAndCountAll(opciones);


        //respuesta exitosa
        res.json({
            success: true,
            data: {
                productos,
                paginacion: {
                    total: count,
                    pagina: parseInt(pagina),
                    limite: parseInt(limite),
                    totalPaginas: Math.ceil(count / parseInt(limite))
                }
            }
        });

    } catch (error) {
        console.error('error en getProductos:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener productos', error: error.message
        })
    }
};

/**
 * obtener los productos por id
 * GET /api/admin/productos/:id
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductoById = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar productos con relacion
        const producto = await Producto.findByPk(id, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'activo']
            }],

            include: [{
                model: Subcategoria,
                as: 'subcategoria',
                attributes: ['id', 'nombre', 'activo']
            }]
        });
           

        //filtrar por estado activo si es especifico
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        }

    

        //Respuesta exitosa
        res.json({
            success: true,
            data: {
                producto
            }
        });

    } catch (error) {
        console.error('error en getProductoById:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener producto', error: error.message
        })
    }
};

/**
 * crear un producto
 * POST /api/admin/productos
 * body: {nombre, descripcion}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const crearProducto =async (req, res) => {
    try {
        const {nombre, descripcion, precio, stock, categoriaId, subcategoriaId} = req.body;

        //validcion 1 verificar campos requeridos
        if (!nombre || !precio || !categoriaId|| !subcategoriaId){
            return res.status(400).json({
                success: false,
                message: 'el nombre, precio, categoriaId y subcategoriaId son requeridos'
            });
        }
    
        /** validacion 2 si el producto existe
        const producto = await Producto.findByPk(ProductoId);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: `no existe el producto con id ${ProductoId}`
            });
        } */

      // validacion 2 verifica si la categoria esta activa

    const categoria = await Categoria.findByPk(categoriaId);

        if (!categoria) {
            return res.status(400).json({
        success: false,
        message: `No existe una categoria con Id ${categoriaId}`
    });
}

        if (!categoria.activo) {
            return res.status(400).json({
        success: false,
        message: `la categoria "${categoria.nombre}" esta inactiva`
    });
}

    




        //validacion 3 verificar que la subcategoria existe y pertenece a una categoria


        const subcategoria = await Subcategoria.findByPk(subcategoriaId);

       if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: `no existe una subcategoria con id ${subcategoriaId}`
            });
        }
         if (!subcategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `la subcategoria "${subcategoria.nombre}" esta inactiva`
            });
        }
         if (subcategoria.categoriaId !== parseInt(categoriaId)) {
            return res.status(400).json({
                success: false,
                message: `la subcategoria "${subcategoria.nombre}" no pertenece a la categoria con id ${categoriaId}`
            });
        }


        //validacion 4 validar precio y stock

        if (parseFloat(precio) < 0){
            return res.status(400).json({
                success: false,
                message: 'el precio no puede ser negativo'
            });
        }

        if (parseInt(stock) < 0){
            return res.status(400).json({
                success: false,
                message: 'el stock no puede ser negativo'
            });
        }


        //obtener imagen}
        const imagen = req.file ? req.file.filename : null;

        //crear Producto
        const nuevoProducto = await Producto.create({
            nombre,
            descripcion: descripcion || null, //si no se proporciona la desccripcion se establece como null
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoriaId: parseInt(categoriaId),
            subcategoriaId: parseInt(subcategoriaId),
            imagen,
            activo: true,
        });


        //recargar con relaciones
        await nuevoProducto.reload({
            include: [
                {model: Categoria, as: 'categoria', attributes: ['id', 'nombre']},
                {model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre']},                
            ]
        })

        //respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: {
                producto: nuevoProducto
            }
        });

        } catch (error) {
            console.error('Error en crearProducto',error);
            
            //si hubo un error eliminar la imagen subida
            if (req.file){
                const rutaImagen = path.join(__dirname, '../uploads/', req.file.filename);
                try {
                    await fs.unlink(rutaImagen);
                }catch (err){
                    console.error('error al eliminar la imagen', err);
                }
            
            
            }
                if (error.name === 'SequelizeValidationError') {
                    return res.status(400).json({
                        success: false,
                        message: 'Error de validacion',
                        errors: error.errors.map(e => e.message)
                    });
                }
            }
        res.status(500).json({
            success: false,
            message: 'Error al crear producto',
            error: error.message
        });
    }

// HASTA AQUI  CORRECCION PROFE
/**
 * actualizar producto
 * PUT /api/admin/productos/:id
 * body: {nombre, descripcion, precio, stock, categoriaId, subcategoriaId}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const actualizarProducto = async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion, stock, precio, categoriaId, subcategoriaId, activo } = req.body;

        //Buscar producto
        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

         // Validar si cambia la| categoria y subcategoria
           if (categoriaId && subcategoriaId !== producto.categoriaId) {
            const categoria = await Categoria.findByPk(categoriaId);

            if (categoria || !categoria.activo) {
                return res.status(404).json({
                    success: false,
                    message: 'categoria invalida o inactiva'
                })
            }
        }

         if (subcategoriaId && subcategoriaId !== producto.subcategoriaId) {
            const subcategoria = await Subcategoria.findByPk(subcategoriaId);

            if (subcategoria || !subcategoria.activo) {
                return res.status(404).json({
                    success: false,
                    message: 'subcategoria invalida o inactiva'
                })
            }

            const catId = categoriaId || producto.categoriaId

            if (!subcategoria.categoriaId !== parseInt(catId)) {
                return res.status(404).json({
                    success: false,
                    message: 'La subcategoria no pertenece a la categoria seleccionada'
                });
            }
         }


          //validar precio y stock

             if (precio !== undefined && parseFloat(precio) < 0){
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser mayor a 0'
            });
        }

        if (stock !== undefined && parseInt(stock) < 0){
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            });
        }

        // Manejar Imagen

        if(req.file){
            //eliminar imagen anterior si existe
            if (producto.imagen){
                const rutaImagenAnterior = path.join(__dirname, '../uploads', producto.imagen);
                try {
                    await fs.unlink(rutaImagenAnterior);
                } catch (err) {
                    console.error('Error al eliminar imagen anterior: ', err);
                }
            }
        }
        producto.imagen = req.file.filename;




        if (!nuevaCategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `La categoria "${nuevaCategoria.nombre}" esta inactiva`
            }); 
        }

        //actualizar campos
        if (nombre !== undefined) producto.nombre = nombre;
        if (descripcion !== undefined) producto.descripcion = descripcion;
        if (stock !== undefined) producto.stock = parseInt(stock);
        if (precio !== undefined) producto.precio = parseInt(precio);
        if (subcategoriaId !== undefined) producto.subcategoriaId = subcategoriaId;
        if (categoriaId !== undefined) producto.categoriaId = parseInt(categoriaId);
        if (activo !== undefined) producto.activo = activo;

        //guardar cambios
        await producto.save();

        //respuesta exitosa
        res.json({
            success: true,
            message: 'producto actualizado exitosamente',
            data: {
                producto,
            }
        });

    } catch (error) {
        console.error('error en actualizarProducto: ', error);
        if (req.file){
            const rutaImagen = path.join(__dirname, '../uploads', req.file.filename);
            try{
                await fs.unlink(rutaImagen);
            } catch (err){
                console.error('Error al eliminar imagen:', err);
            }
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        });
    }
};

// HASTA AQUI SE HA CORREGIDO EL CONTROLLER DE PRODUCTO

/**
 * activar/desactivar producto
 * PATCH /api/admin/subcategorias/:id/estado
 *
 * al desactivar una subcategoria se desactivan todos los productos relacionados
 * @param {Object} req request express
 * @param {Object} res response express
 */

const toggleProducto = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar producto
        const producto = await Producto.findByPk (id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            });
        }

        //alternar estado activo
        const nuevoEstado = !subcategoria.activo;
        subcategoria.activo = nuevoEstado;

        //guardar cambios
        await subcategoria.save();

        //contar cuantos registros se afectaron
        const productosAfectados = await Producto.count({where: {subcategoriaId: id}
        });

        //respuesta exitosa
        res.json({
            success: true,
            message: `subcategoria ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
            data: {
                subcategoria,
                productosAfectados
                }
        });

    } catch (error) {
        console.error('error en toggleSubcategoria:', error);
        res.status(500).json({
            success: false,
            message: 'error al cambiar estado de la subcategoria',
            error: error.message
        });
    }
};

/**
 * eliminar producto
 * DELETE /api/admin/subcategorias/:id
 * Elimina el produto y su imagen 
 * @param {Object} req request express
 * @param {Object} res request express
 */
const eliminarProducto = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar producto
        const producto = await Producto.findByPk(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'producto no encontrado'
                });
            }

            // el hook beforeDestroy se ncarga de eliminar la imagen



            //validacion verificar que no tenga productos
            const productos = await producto.count({
                where: {subcategoriaId: id}
            });

            if (productos > 0) {
                return res.status(400).json({
                    success: false,
                    message: `no se puede eliminar la subcategoria porque tiene ${productos} 
                    productos asociados usa PATCH/api/admin/subcategorias/:id
                    togle para desactivarla en lugar de eliminar`
                });
            }

            //eliminar subcategoria
            await subcategoria.destroy();

            //respuesta exitosa
            res.json({
                success: true,
                message: 'subcategoria eliminada exitosamente'
            });

    } catch (error) {
        console.error('error al eilminar la subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'error al eliminar la subcategoria',
            error: error.message
        });
    }
};

/**
 * Actualizar stock de un Producto
 * 
 * PATCH /api/admin/productos/:id/stock
 * body: {cantidad, operacion: 'aumentar' | 'reducir' | 'establecer'}
 * @param {Objet} req request express
 * @param {Objet} res response express
 */

const actualizarStock = async (req, res) => {
    try {
        const {id} = req.params;
        const {cantidad, operacion} = req.body;
        
        if (!cantidad || !operacion) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere cantidad y operacion'
            });
        }
       
        const cantidadNUm = parseInt(cantidad);
        if (cantidadNUm < 0 ) {
            return res.status(400)({
                success: false,
                messag: 'La cantidad no puede ser negativa'
            });
        }

        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        let nuevoStock;

        switch (operacion) {
            case 'aumentar':
                nuevoStock = producto.aumentarStock(cantidadNUm);
                break; 
            case 'reducir':
                if (cantidadNUm > producto.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `No hay suficiente stock. stock actual: ${producto.stock}`
                    });
                }
                nuevoStock = producto.reducirStock(cantidadNUm);
                break;
            case 'establece':
                nuevoStock = cantidadNUm;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    messsage: 'Operacion invalida usa aumentar reducir o establecer'
                });
        }


        producto.stock = nuevoStock;
        await producto.save();

        res.json({
            success: true,
            message: `Stock ${operacion === 'aumentar' ? 'reducido':
                 operacion === 'reducir' ? 'reducido': 'establecido'} exitosamente`,
                 data: {
                    productoId: producto.id,
                    nombre: producto.nombre,
                    stockAnterior: operacion === 'establecer' ? null :
                 (operacion === 'aumentar' ? producto.stock - cantidadNUm : producto.stock + cantidadNUm),
                 stockNuevo: producto.stock
                 }
        });

    } catch (error) {
        console.error('error en actualizarStock: ', error);
        res.status(500).json({
            success: false,
            message: 'error al actializar stock',
            error: error.message
        });
    }
};


//exportar todos los controladores
module.exports = {
    getProductos,
    getProductoById,
    crearProducto,
    actualizarProducto,
    toggleProducto,
    eliminarProducto,
    actualizarStock
};