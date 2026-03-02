/**
 * Controlador de pedidos 
 * gestion de pedidos 
 * requiere autenticacion
 */
//importar modelos

const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Carrito = require('../models/carrito');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');

/**
 * Crear pedido desde el carrito (checkout)
 * POST /api/cliente/pedidos
 */

const crearPedido = async (req, res) => {
    const { sequelize } = require('../config/database');
    const t = await sequelize.transaction();
    
    try {
        const { direccionEnvio, telefono, metodoPago = 'Efectivo', notasAdicionales } = req.body;

        //Validacion 1 direccion requerida
        if (!direccionEnvio || direccionEnvio.trim() === '') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'La direccion de envio es requerida'
            }); 
        }

        //Validacion 2 telefono
        if (!telefono || telefono.trim() === '') {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El tyelefonoi es requerido'
            });
        }

        // validacion 3 metodo de pago
        const metodosValidos = ['efectivo', 'tarjeta', 'transferencia'];
        if (!metodosValidos.includes(metodoPago)) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: `Metodo de pago invalido, opciones: ${metodosValidos.join(',')}`
            });
        }

        // obtener items del carrito

        const carritoItems = await Carrito.findAll({
            where: { usuarioId: req.user.usuarioId },
            include: [{
                model: Producto,
                as: 'producto',
                atributtes: ['id', 'nombre', 'precio', 'stock', 'activo']
            }],
            transaction: t
        });

        if (eliminarItemCarrito.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El carrito esta vacio'
            })
        }
    }
}