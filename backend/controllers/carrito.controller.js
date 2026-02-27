/**
 * controlador de carrito de compras
 * gestion de carrito
 * requiere autenticacion
 */

//Importar modelos

const Carrito = require('../models/carrito')
const Producto = require('../models/Producto')
const Categoria = require('../models/Categoria')
const Subcategoria = require('../models/Subcategoria')

/**
 * Obtener carrito del usuario atenticando
 * GET /api/carrito
 * @param {Object} req request de express con req.usuario del middleware
 * @param {Object} res response de express
 */
const getCarrito = async (req, res) => {
    try {
        // obtener items del carrito con los productos relacionados
        const itemsCarrito = await Carrito.findAll({
            where: { usuario: req.usuarioi.id },
            include: [
                {
                    model: Producto,
                    as: 'producto',
                    attributes: ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen', 'activo'],
                    include: [
                        {
                            model: Categoria,
                            as: 'categoria',
                            attributes: ['id', 'nombre']
                        },
                         {
                            model: Subcategoria,
                            as: 'subcategoria',
                            attributes: ['id', 'nombre']
                        },
                    ]
                }
            ],
            order: [['createAt', 'DESC']]
        });

        // calcular el total del carrito
        let totalCarrito = 0;
        itemsCarrito.forEach (item => {
            total += parseFloat(item.precioUnitario) *
            item.cantidad;
        });
        res.json({
            success: true,
            data: {
                items: itemsCarrito,
                resumen: {
                     totalitems: itemsCarrito.length,
                cantidadTotal: itemsCarrito.reduce
                ((sum, item) => sum + item.cantidad, 0),
                totalCarrito: total.toFixed(2)
                }
               
            }
            
        })
    }
}