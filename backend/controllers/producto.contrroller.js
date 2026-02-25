/**
 * controlador de subcategorias
 * maneja las operaciones crud y activar y desactivar subcategorias
 * solo accesible por admins
 */

/**
 * importar modelos
 */

const producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');

//importar path y fs para manejo de imagenes
const path = require('path');
const fs = require('fs');
const { prototype } = require('events');



/**
 * obtener todas los productos
 * query params:
 * categoriaId: Id de la categoria para filtrar por categoria
 * subcategoriaId: Id de la subcategoria para filtrar por subcategoria
 * activo true/false (filtrar por estado activo o inactivo)
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductos = async (req, res) => {
    try {
        const { categoriaId,
             subcategoriaId, 
             activo, 
             conStock, 
             buscar, 
             pagina = 1, 
             limite = 100
             } = req.query;

             // construir filtros
             const where = {};
             if (categoriaId) where.categoriaId = categoriaId;
             if (subcategoriaId) where.subcategoriaId = subcategoriaId;
             if (activo !== underfindd) where.activo = activo === 'true';
             if (conStock === 'true') where.stock = { [require ('squelize').Op.gt]: 0 };

             //paginacion
             const offset = (parseInt(pagina) -1 ) * parseInt (limite);


        //opciones de consulta
        const opciones = {
            where,
            include:  [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],

              include:  [
                {
                    model: Subcategoria,
                    as: 'subcategoria',
                    attributes: ['id', 'nombre']
                }
            ],

            limit: parseInt(limite),
            offset,
            order: [['nombre', 'ASC']] //Ordenar por orden alfabetico
        };

        // obtener productos y total
        const { count, rows: productos } = await Producto.findAndCountAll(opciones);



        //respuesta exitosa
        res.json({
            success: true,
            data: {
                productos,
                paginacion: {
                    total: count,
                    pagina: parseInt(pagina),
                    limite: parseInt(limite),
                    totalpaginas: Math.ceil(count / parseInt(limite))
                }
            }
        });

    } catch (error) {
        console.error('error en getProductos:', error);
        res.status (500).json({
            success: false,
            message: 'error al obtener productos',
            error: error.message
        })
    }
};

/**
 * Obtener todas las subcategorias por id
 * GET /api/subcategorias/:id
 *
 * @param {Object} req request express
 * @param {Object} res response express
 */

const getProductoById = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar productos con relacion
        const producto = await Producto.findByPk(
            id, {
                include: [{
                model: Categoria,
                as: 'categorias',
                attributes: ['id', 'nombre', 'activo']
            }],
              include: [{
                model: subategoria,
                as: 'subcategorias',
                attributes: ['id', 'nombre', 'activo']
              }]

        });

    

        //respuesta exitosa
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
            message: 'Error al obtener el prodcuto',
            error: error.message,
        });
    }
};

/**
 * crear una subcategoria
 * POST /api/admin/subcategorias
 * body: {nombre, descripcion}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const crearProducto =async (req, res) => {
    try {
        const {nombre, descripcion, precio, stock, categoriaId, subcategoriaId} = req.body;

        //validcion 1 verificar campos requeridos
        if (!nombre || !precio ||  !categoriaId || !subcategoriaId){
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos nombre, precio, categoriaId, subcategoriaId'
            });
        }


/*

        //Validacion 2 verificar si la categoria exista
        const categoria = await categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: `no existe la categoria con id ${categoriaId}`
            });
        }*/

        //Validacion 2 verifica si la categoria esta activa
        const categoria = await Categoria.findByPk (categoriaId);
        if (!categoria.activa){
            return res.status(400).json({
                success: false,
                message: `No existe una categoria con el Id "${categoriaId}" `
            });
        }
        if (!categoria.activo) {
            return res.status(400).json({
                success: false,
                message: `la categoria "${categoria.nombre} esta inactiva"`
            });
        }

        //validacion 3 verificar que la subcategoria esxiste y pertenece a una categoria 
        const subcategoria = await subcategoria.findByPK(subcategoriaId);
        if (!subcategoria) {
            return res.status(404).json({
                success: false,
                message: `No existe una categoria con Id ${subcategoriaId}`
            });
        }
           if (!subcategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `Ls subcategoria "${subcategoria.nombre} esta inactiva"`
            });
        }
           if (!subcategoria.categoriaId !== parseInt (categoriaId)) {
            return res.status(400).json({
                success: false,
                message: `La subcategoria "${subcategoria.nombre}" no pertenece a la categoria con id ${categoriaId}`
            });
        }


        // Validacion 4 validar precio y stock

        if (parseFloat(precio) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser mayor a 0'
            });
        }

          if (parseInt(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El stock no puede ser negativo'
            });
        }

        // obtener imagen
        const imagen = req.file ? req.file.filename : null;


        //crear producto
        const nuevoProducto = await producto.create({
            nombre,
            descripcion: descripcion || null, //si no se proporciona la desccripcion se establece como null
            precio: parseFloat(precio),
            stock: parseInt(stock),
            categoriaId: parseInt(categoriaId),
            subcategoriaId: parseInt(subcategoriaId),
            iamgen,
            activo: true
        });

        //Recargar con relaciones
        await nuevoProducto.reload({
            include: [
                {model: Categoria, as: 'categoria', 
                atributtes: ['id', 'nombre']},
                {model: Subcategoria, as: 'suvcategoria', 
                atributtes: ['id', 'nombre']},
            ]
        });

        //si hubo un error eliminar la iagen subida
        if (req.file){
            const rutaImagen = path.join(__dirname, '../uploads', req.file.filename);
            try {
                await fs.unlink(rutaImagen);
            } catch (err) {
                console.error('error al eliminar la imagen', err);
            }
        }

        if (error.name === 'SequelizeteValidationError')
        {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

            res.status(500).json({
                success: false,
                message: 'error al crear el producto',
                error: error.message
            });
    
        } catch (error) {
            console.error('error en crearProducto:', error);
            res.status(500).json({
                success: false,
                message: 'error al crear el producto',
                error: error.message
            });
        }
    };
/**
 * actualizar subcategoria
 * PUT /api/admin/subcategorias/:id
 * body: {nombre, decripcion, categoriaId}
 * @param {Object} req request express
 * @param {Object} res response express
 */

const actualizarSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre, descripcion, categoriaId } = req.body;

        //Buscar subcategoria
        const Subcategoria = await subcategoria.findByPk(id);

        if (!Subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'Subcategoria no encontrada'
            });
        }

        //Validacion 1 si se cambia el nombre verificar que no exista
        if (categoriaId && categoriaId !== Subcategoria.categoriaId) {
            const nuevaCategoria = await Categoria.findByPk(categoriaId);
            if (!nuevaCategoria) {
                return res.status(404).json({
                    success: false,
                    message: `No existe la categoria con id ${categoriaId}`
                });
            }
        }

        if (!nuevaCategoria.activo) {
            return res.status(400).json({
                success: false,
                message: `la categoria "${nuevaCategoria.nombre}" esta inactiva`
            });
        }

        //validacion si se cambia el nombre verificar que no exista la categoria
        if (nombre && nombre !== Subcategoria.nombre) {
            const categoriaFinal = categoriaId || Subcategoria.categoriaId; //si no se cambia la categoria usar la categoria actual
            const subcategoriaConMismoNombre = await subcategoria.findOne({
                where: {
                    nombre,
                    categoriaId: categoriaFinal
                }
            });

            if (subcategoriaConMismoNombre) {
                return res.status(400).json({
                    success: false,
                    message: `ya existe una subcategoria con el nombre "${nombre}" en esta categoria`
                });
            }
        }

        //actualizar campos
        if (nombre !== undefined) Subcategoria.nombre = nombre;
        if (descripcion !== undefined) Subcategoria.descripcion = descripcion;
        if (categoriaId !== undefined) Subcategoria.categoriaId = categoriaId;
        if (activo !== undefined) Subcategoria.activo = activo;

        //guardar cambios
        await subcategoria.save();

        //respuesta exitosa
        res.json({
            success: true,
            message: 'subcategoria actualizada exitosamente',
            data: {
                Subcategoria,
            }
        });

    } catch (error) {
        console.error('error en actualizarSubcategoria: ', error);
        if (error.name === 'sequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validacion',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar subcategoria',
            error: error.message
        });
    }
};
/**
 * activar/desactivar subcategorias
 * PATCH /api/admin/subcategorias/:id/estado
 *
 * al desactivar una subcategoria se desactivan todos los productos relacionados
 * @param {Object} req request express
 * @param {Object} res response express
 */
const toggleSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar subcategoria
        const Subcategoria = await subcategoria.findByPk (id);

        if (!Subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'subcategoria no encontrada'
            });
        }

        //alternar estado activo
        const nuevoEstado = !Subcategoria.activo;
        Subcategoria.activo = nuevoEstado;
        
        //guardar cambios
        await subcategoria.save();

        //contar cuantos registros se afectaron
        const productosAfectados = await Producto.count({where: {categoriaId: id}
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
        console.error('error en togglesubategoria:', error);
        res.status(500).json({
            success: false,
            message: 'error al cambiar estado de la subcategoria',
            error: error.message
        });
    }
};

/**
 * eliminar subcategoria
 * DELETE /api/admin/subcategorias/:id
 * Solo permite eliminar si no tiene productos relacionados
 * @param {Object} req request express
 * @param {Object} res request express
 */
const eliminarSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //buscar subcategoria
        const Subcategoria = await subcategoria.findByPk(id);
            if (!Subcategoria) {
                return res.status(404).json({
                    success: false,
                    message: 'subcategoria no encontrada'
                });
            }

            //validacion verificar que no tenga productos
            const producto = await Producto.count({
                where: {subcategoriaId: id}
            });

            if (productos > 0) {
                return res.status(400).json({
                    success: false,
                    message: `no se puede eliminar la subcategoria porque tiene ${productos} subcategorias asociadas usa PATCH /api/admin/subcategorias/:id togle para desactivarla en lugar de eliminar `
                });
            }

            //eliminar subcategoria
            await Subcategoria.destroy();

            //respuesta exitosa
            res.json({
                success: true,
                message: 'subcategoria eliminada exitosamente'
            });

    } catch (error) {
        console.error('error al eilminar subcategoria', error);
        res.status(500).json({
            success: false,
            message: 'error al eliminar subcategoria',
            error: error.message
        });
    }
};

/**
 * Obtener estadisticas de una subcategoria
 * GET /api/admin/subcategorias/:id/estadisticas
 * retorna
 * total de subcategorias activas / inactivas
 * total de productos activos / inactivos
 * valor total del inventario
 * stock total
 * @param {Object} req request express
 * @param {Object} res request express
 */
const getEstadisticasSubcategoria = async (req, res) => {
    try {
        const {id} = req.params;

        //verificar que la subcategoria exista
        const Subcategoria = await subcategoria.findByPk(id [{
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre']
            }]
        }]);

        if (!Subcategoria) {
            return res.status(404).json({
                success: false,
                message: 'subcategoria no encontrada'
            });
        }

        //contar productos
        const totalProductos = await producto.count({
            where: {subcategoriaId: id}
        });
        const productosActivos = await producto.count({
            where: { subcategoriaId:  id, activo: true}
        });

        //obtener productos para calcular estadisticas
        const productos = await Producto.findAll({
            where: {Subcategoria: id},
            attributes: ['precio', 'stock']
        });

        //calcular estadisticas de inventario
        let valorTotalInventario = 0;
        let stockTotal = 0;

        productos.forEach(producto => {
            valorTotalInventario += parseFloat(producto.precio) * producto.stock;
        });

        //respuesta exitosa
        res.json({
            success: true,
            data: {
                Subcategoria: {
                id: Subcategoria.id,
                nombre: Subcategoria.nombre,
                activo: Subcategoria.activo,
                categoria: Subcategoria.categoria,
                },
                estadisticas: {
                    productos: {
                        total: totalProductos,
                        activas: productosActivos,
                        inactivas: totalProductos - productosActivos
                    },

                    inventario: {
                        stockTotal,
                        valorTotal: valorTotalInventario.toFixed(2) //quitar decimales
                    }
                }
            },
        });

    } catch (error) {
        console.error('error en getEstadisticasSubcategoria', error);
        res.status(500).json({
            success: false,
            message: 'error al obtener estadisticas',
            error: error.message
        });
    }
};

//exportar todos los controladores
module.exports = {
    getSubcategorias,
    getSubcategoriaById,
    crearSubcategoria,
    actualizarSubcategoria,
    toggleSubcategoria,
    eliminarSubcategoria,
    getEstadisticasSubcategoria
};