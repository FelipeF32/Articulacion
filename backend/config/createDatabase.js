/**
 * script de inicializacion de la base de datos
 * este script crea la base de datos si no existe
 * debe esjecutarse una sola vez antes de iniciar el servidor
 */

//importar mysl2 para la conexion directa

const mysql = require('mysql2/promise');

// Impotar dotenv para variables de entorno
require('dotenv').config();

//funcion para crear la base de datos
cosnt createDatabase = async () => {
    let connection;

    try {
        console.log('iniciando creacion de base de datos ... /n');

        //Conectar a MySQL sin especificar la base de datos
        console.log('conectando a MySQL ... ');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST  || 'localhost',
            port: process.env.DB_PORT  || 3306,
             user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
            
        });
        console.log('conexion a MySQL establecida correctamente');
        //Crear la base de datos si no existe
        const dbName = process.env.DB_NAME || 'ecommerce_db';
        console.log(`creando base de datos ${dbName} si no existe ...`);

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`'${dbName}\`' creada/verificada correctamente. \n`);


        //cerrar conexion
        await connection.end();

        console.log( ' ¡Proceso completado! Ahora puedes iniciar el servidor con "npm start"\n');
        } catch (error) {
            console.error('X error al crear la base de datos:', error.message);
            console.error('\n Verifica que:');
            console.error('1. XAMPP esté corriendo');
            console.error('2. MySQL este iniciado en XAMPP');
            console.error('3. Las credenciales en el archivo .env sean correctas');

            if (connection) {
                await connection.end();
            }

            process.exit(1); //salir con error

        }
}; 

//ejecutar la funcion
createDatabase();