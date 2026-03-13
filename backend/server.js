/**
 * Servidor principal del backend
 * este es el archivo principal del servidor del backend
 * configura express, middlewares, rutas, y coneion de base de datos
 */

// importaciones

//importar express para crear el servidor
const express = require('express');

//importar cors para permitir solicitudes desde el frontend
const cors = require('cors');

//importar path para manejar rutas de archivos
const path = require('path');

//importar dotenv para manjker variables de entorno
require('dotenv').config();

//importar configuraciones de la base de datos
const dbconfig = require('./config/database');

//importar modelos y asociaciones 
const { initAssociations } = require('./models');

//importar seeders
const { runSeeders } = require('../seeders/adminSeeder');
const { timeStamp } = require('console');
const { syncDataBase, testDBConnection } = require('./config/database');

//Crear aplicaciones express

const app = express();

//Obtener el puerto desde las la variable de entorno
const PORT = process.env.PORT || 5000;

//Middlewares globales

//cors permiten peticiones desde el frontend
//configura que los dominios pueden hacer peticiones al backend

app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://localhost:3000', //url del frontend
    credentials: true, //permitir enviar cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], //metodos permitidos
}));

/**
 * express.json() - parse body de las peticiones con formato json
 */
app.use(express.json())

/**
 * express.urlencoded() - parse el body de los formularios
 * las imagenes estaran disponibles
 */

app.use(express.urlencoded({extended: true}));


/**
 * servir archivos estaticos imagenes desde la carpeta raiz
 */

app.use('/upload', express.static(path.join(__dirname,'uploads')));

//middleware para logging de peticiones
// muestra en consola coda peticion que llega el aervidor

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) =>{
        console.log(`ok ${req.method} ${req.path}`);
        next();
    });
}

// rutas
// rutas raiz  verificar que el servidor estya corriendo

app.get('/,', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor E-commerce Backend corriendo correctamente',
        version: '1.0.0',
        timeStamp: new Date().toISOString()
    });
});

// ruta de salud verifica que el servidor como esta
app.get('/api/health', (req,res) => {
    res.json({
        success: true,
        status: 'healthy',
        database: 'connected',
        timeStamp: new Date().toISOString()
    });
});

//rutas pi

//rutas de autenticacion 
//incluye registro login, perfil

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

//rutas del administrador
// requiere autenticacion y rol de administrador 

const adminRoutes = require('./routes/admin.routes');
app.use('./api/admin', adminRoutes);

//rutas del cliente

const clienteRoutes = require('./routes/cliente.routes');
app.use('./api/admin', clienteRoutes);

// manejo de rutas no econtradas (404)

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
    });
});

// manejo de errores globales
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    // error de multer subida de archivos
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: 'Error al subir el archivo',
            error: err.message,
        });
    }
    //otros errores
    res.status(500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
});

// inicializar servidor y base de datos

/**
 * funcion principal para iniciar el servidor
 * prueba la conexion a MySQL
 * sincroniza los modelos (crea las tablas)
 * inicia el servidor express
 */

const startServer = async () => {
    try {
        //paso 1 probar conexion a MySQL
        console.log('Conectando a MySQL...');
        const dbConnected = await testDBConnection();

        if (!dbConnected) {
            console.error('No pudo conectar a Mysql verificar XAMPP y el archivo .env');
            process.exit(1);//Salir si no hay conexion
        }

        // paso 2 sincronizar modelos (crear tablas)
        console.log('Sincronizando los modelos con labase de datos...');

        //inicializar asociaciones entre los modelos
        initAssociations();
        // en desarrollo alter puede ser un true para actualizar la estructura
        //en produccion debe ser false para no perder los datos

        const alterTables = process.env.NODE_ENV === 'development';
        const dbSynced = await syncDataBase(false, alterTables);

        if (!dbSynced) {
            console.error('X Error al sincronizar la base de datos');
            process.exit(1);
        }

        //paso 3 ejecutar seeders datos iniciales
        await runSeeders();

        //paso 4 iniciar servidor express
        app.listen(PORT, () => {
            console.log('/n___________');
            console.log(`URL: https://localhost:${PORT}`);
            console.log(`base de datos: ${process.env.DB_NAME}`);
            console.log(`Modo: ${process.env.NODE_ENV}`);
            console.log('Servidor listo para realizar peticiones');
        });
    } catch (error) {
        console.error('X Error fatal al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

//manejo de cierre
//captura el ctrl + c para cerrar el servidor coreectamen5te

process.on('SIGINT', () => {
    console.error('X Error no manejado:', err.message);
    process.exit(1);
});

// iniciar servidor solo si se ejecuta directamente
if (require.main === module) {
    startServer();
}

// exportar app para testing
module.exports = app;