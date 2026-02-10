/** configuracion de la base de datos */

//importar sequelize
const { Sequelize } = require('sequelize');

//importar dotenv para variables de entorno
require('dotenv').config();

//crear instancias de sequelize
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',

        //configuracion de pool de conexiones
        //Mantener las conexiones abiertas para mejorar el rendimiento
        pool: {
            max: 5, //Numero maximo de conexiones en el pool
            min: 0, //Numero minimo de conexiones ene el pool
            acquire: 30000, //Tiempo maximo para adquirir una conexion antes de lanzar un error
            idle: 10000 //Tiempo maximo que una conexion puede esatr inactiva antes de ser liberada
        },

        //configuracion de logging
        //Permite ver las consultas de mysql por consola

        loging: process.env.NODE_ENV === 'development' ? console.log: false,

        // ZOna horaria
        timezone: '-05:00', //Zona hortaria de colombia

        //opciones adicionales pueden sewr arregladas aqui
        define: {
            timestamps: true, //Agrega campos createAt y updateAt a todas las tablas
            underscored: false, //Usa snake_case en lugar de camelCase para los nombres de columnas

            //frazen: true //Evita que sequelize pluralice los nombres de las tablas
            freezeTableName: true


    }
});

/* funvion para probar la conexion a la base de datos esta funcion se llamara al iniciar el servidor */

const testDBConnection = async () => {
    try {
        //intentar autenticar con la base de datos
        await sequelize.authenticate(); //si la autenticación es exitosa se establece la concwexion
        console.log('Conexion a MySQL establecida correctamente');
        return true;
    } catch (error) {
        console.error('X error al conectar a MySQL:',
        error.message); //si hay un error al conectar se muestra el mensaje de error
        console.error('X verifica que XAMPP erste corriendo y las credenciales en .env sean correctas'); //
        return false;
    }}

//* Funcion parta wsincronizqar los modelos con la base de datos
    //ta funcion creara las tablas automaticamente basandose en los modelos 


    /*@paramv {bolean} force -  si es true, elimina y recrea todas las tablas
    /* @param {bolean} alter - si es true, modifica las tablas existentes para que coincidan con los modelos definidos en sequelize, si es false, no hace ningun cambio en las tablas existentes */
    const syncDataBase = async (force = false, alter = false) => {
        try {
            //sincronizar los modelos con la base de datos
            await sequelize.sync({ force, alter });

            if (force) {
                console.log('Base de datos sincronizada cona (todas las tablas recreadas)');
            } else if (alter) {
                console.log('Base de datos sincronizada (tablas alteradas seun los modelos)');
            } else {
                console.log('Base de datos sincronizada correctamente');

            }
            return true;

        } catch (error) {
            console.error('X error al sincronizar la base de datos:', error.message);
            return false;
        }
    };
    // Exportar la instancia de sequelize y las funciones de prueba y sincronizacion
    module.exports = {
        sequelize,
        testDBConnection,
        syncDataBase
    };