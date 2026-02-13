/**
 * Modelo carrito
 * define la tabla carrito en la base datos
 * almacena los productos que cada usuario agrega a su carrito
 */

//Importar DataTrypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const {sequelize} = require('../config/database');
const { after } = require('node:test');
const { table, timeStamp } = require('node:console');

/**
 * Definir el modelo Carrito
 */
const Carrito = sequelize.define('Carrito', {
    //Campos de la tabla 
    //Id Indentificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false

    },


    // UsuarioId ID del usuario dueño del carrito 
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {

            model: 'Usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // si se elimina el usuario se elimina el carrito
        validate: {
            notNull: {
                msg: 'Debe especificar su usuario'

            }

        }
    },
    
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique : {
            msg: 'Ya existe una categoria con ese nombre'
        },
        validate : {
            notEmpty: {
                msg: 'El nombre de la categoria no puede estar vacio'
            },
            len: {
                args: [2, 100],

            }
        }
    },

    /**
     * descripcion de la categoria
     */

    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },

     // Producto ID del producto en el carrito 
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {

            model: 'Productos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // elimina el producto del carrito
        validate: {
            notNull: {
                msg: 'Debe especificar su producto'

            }

        }
    },

    // Cantidad de este producto en el carrito
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'La cantidad debe ser un numero entero'
            },
            min: {
                args: [1],
                msg: 'La cantidad debe ser al menos 1'
            }
        }
    },

    /**
     * Precio Unitario del producto al momento de agregarlo al carrito
     * se guarda para mantener el precio aunque el producto cambie de precio 
     */
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El precio debe ser un numero decimal valido'
            },
            min: {
                args: [0],
                msg: 'El precio no puede ser negativo'
            }
        }
    }
}, {
    //opciones del modelo
    tableName: 'carritos',
    timestamp: true,
    //indice para mejorar las busquesdas
    indexes: [
        {
            //indice para buscar carrito por usuario
            fields: ['usuarioId']
        },
        {
            //Indice compuesto: un usuario no puede tener el mismo producto duplicado
        unique: true,
        fields: ['usuarioId', 'productoId'],
        name: 'usuario_producto_unique'
        }
    ],
    /**
         * Hooks Acciones automaticas
         */

        hooks:{
            /**
             *beforeCreate - se ejecuta antes de crear una subcategoria
             *verifica que la categoria padre este activa 
             */

             beforeCreate: async (subcategoria) => {
                const Categoria = require('./Categoria');

                //buscar categoria padre
                const categoria = await Categoria.findByPk(subcategoria.categoriaId);

                if (!categoria) {
                    throw new Error('La cateoria seleccionada no existe');

                }

                if (!categoria.activo) {
                    throw new Error('No se puede crear una subcategoria en una categoria inactiva');
                }

             },

              /**
             *afterUpdate. se ejecuta despues de actualizar una categoria
             *si se desactiva una categoria se desactivan todas sus subcategorias y productos
             */

            
            afterUpdate: async (categoria, options) => {
                //verificar si el campo activo se cambio
                if (categoria.changed('activo') && !categoria.activo) {
                    console.log(`Desactivando categoria: ${categoria.nombre}`);

                    //Importar modelos (aqui para evitar dependencias circulares)
                    const { Subcategoria } = require('./subcategoria');
                    const producto = require('./Producto');
                    
                    try {
                        //paso 1 desactivar las subcategorias de esta subcategoria
                        

                        //paso 2 desactivar los productos de esta categoria

                        const productos = await producto.findAll({
                            where: { categoriaId: categoria.id }

                        });

                        for (const producto of productos) {
                            await producto.update({ activo: false }, { transaction: options.transaction });
                            console.log(`Producto desactivado: ${producto.nombre}`);

                    }

                    console.log(`categoria y elementos relacionados desactivados correctamente`);
                }catch (error) {
                    console.error('Error al desactivar categoria y elementos relacionados:', error.message);
                    throw error;
                }
            }

        }
    }
});

// METODOS DE INSTANCIA

/**
 * Metodo para contar subcategorias de esta categoria
 *
 * @returns {Promise<number>} - numero de subcategorias
 */
Subcategoria.prototype.contarProductos = async function() {
    const  Producto  = require('./Producto');
    return await Producto.count({ where: { subcategoriaId: this.id } });
};


