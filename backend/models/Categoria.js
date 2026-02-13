/**
 * Modelo de Categoria
 * define la tabla categoria en la base datos
 * almacena las categorias principales de los productos
 */

//Importar DataTrypes de sequelize
const { DataTypes } = require('sequelize');

//Importar instancia de sequelize
const {sequelize} = require('../config/database');
const { after } = require('node:test');

/**
 * Definir el modelo Categoria
 */
const Categoria = sequelize.define('Categoria', {
    //Campos de la tabla
    //Id Indentificador unico (PRIMARY KEY)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false

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

    /**
     * Activo estado de la categoria
     * si es false la categoria y todas sus subcategorias y productos se ocultan
     */
    activo : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false

    },

     }, {
        //opciones del modelo

        tableName: 'categorias', // nombre de la tabla en la base de datos
        timestamps: true, // agrega campos createdAt y updatedAt
     

        /**
         * Hooks Acciones automaticas
         */

        hooks:{
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
                    const producto = require('./producto');
                    
                    try {
                        //paso 1 desactivar las subcategorias de esta categoria
                        const subcategorias = await Subcategoria.findAll({
                            where: { categoriaId: categoria.id }

                        });

                        for (const subcategoria of subcategorias) {
                            await subcategoria.update({ activo: false }, { transaction: options.transaction });
                            console.log(`Subcategoria desactivada: ${subcategoria.nombre}`);




                        }

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
Categoria.prototype.contarSubcategorias = async function() {
    const  Subcategoria  = require('./subcategoria');
    return await Subcategoria.count({ where: { categoriaId: this.id } });
};

/**
 * Metodo para contar productos de esta categoria
 *
 * @returns {Promise<number>} - numero de productos
 */
Categoria.prototype.contarProductos = async function() {
    const Producto  = require('./producto');
    return await Producto.count({ where: { categoriaId: this.id } });
};