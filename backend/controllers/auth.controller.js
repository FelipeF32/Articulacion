/**
 * Controlador de usuarios
 * maneja el registro, login y obtencion del perfil del usuario
 */

/**
 * Importar modelos
 */
const Usuario = require('../models/Usuario');
const { generarToken } = require('../config/jwt');



/**
 * Obtener todos los usuarios
 * GET / api / usuarios
 * query params:
 * activo true/false (filtrar por estado)
 *
 * @param {Object} req request Express
 * @param {Object} res response Express
 */

const registrar = async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, direccion } = req.body;

        //validacion 1 verificar q todos los capos requeridos esten presentes
        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos nombre, apellido, email, password'
            });
        }

        //validacion 2 verificar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email invalido'
            });
        }

        //validacion 3 verificar la longitud de la contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });

        }

        //validacion 4 verificar que el email no este registrado
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'El email ya esta registrado'
            });
        }

/**
 * Crear  usuario
 * el hook beforeCreate en el modelo se encarga de hashear la contraseña antes de guardarla en la base de datos
 * en el rol por defecto es cliente 
 * @param {Object} req request Express
 * @param {Object} res response Express
 */


        //Crear usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email, 
            password,
            rol,
            telefono: telefono || null, //si no se proporciona se establece como null
            direccion: direccion || null, //si no se proporciona se establece como null
            rol: 'cliente' //rol por defecto
        });

        // generar token JWT con datos del usuario
        const token = generarToken({
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        });

        //Respuesta exitosa
        const usaurioRespuesta = nuevoUsuario.toJSON();
        delete usaurioRespuesta.password; //eliminar campo password de la respuesta
        res.status(201).json({
            success: true,
            message: 'Usuario resgistrado exitosamente',
            data: {
                usuario: usaurioRespuesta,
                token
            }
        });

    } catch (error) {
        console.error('Error en registrar')
        return res.status(400).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * iniciar sesion login
 * Autenticacion a un usaurio con email y contraseña
 * retorna el usuario y un token JWT si las credenciales son validas
 * POST /api/auth/login
 * Body: {email, password}
 */

const login = async (req, res) => {
    try {
        //extraer credenciales del body
        const { email, password } = req.body;

        //validacion 1 verificar que se proporcionen email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }
        
        //validacion 2: buscar usuario por email
        //necesitamos incluir el password aqui normalmente se excluye por seguridad
        const usuario = await Usuario.scope('withPassword').findOne({
            where: { email }
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // validacion 3: verificar que el usuario esta activo
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario inactivo, contacta al administrador'
            });
        }


        // validacion 4: verificar que la contraseña sea correcta
        // usamos el metodo compararPassword del modelo de usaurio
        const passwordValida = await usuario.compararPassword(password);

        if (!passwordValida) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            });
        }

        // generar token JWT con datos basicos del usuario
        const token = generarToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        });

        //preparar respuesta si password
        const usuarioRespuesta = usuario.toJSON();
        delete usuarioRespuesta.password; //eliminar campo password de la respuesta

        //Respuesta exitosa
        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: usuarioRespuesta,
                token
            }
        });

         
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al iniciar sesion',
            error: error.message
        });
    }
};

/**
 * Obtener perfil del usuario autenticado
 * require middleware verificarAuth
 * get /api/auth/profile
 * headers: { Authorization: 'Bearer TOKEN' }
 */

const getMe= async (res, res) => {
    try {
        //el usuario ya esta en req.usuario 
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: { exclude: ['password']}
        });
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        // respuiesta exitosa
        res.json({
            success: true,
            data: {
                usuario 
            }
        });
        
    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener',
            error: error.message
        });
    }
};


/**
 * Actualizar perfil de usuario autenticado
 * Permite al usuario actualizar su informacion personal
 * PUT /admin/auth/me
 * Body: {nombre, apellido, email, password, rol, telefono, direccion }
 * @param {Object} req request Express
 * @param {Object} res response Express
 */

const updateMe = async (req, res) => {
    try {
        const { nombre, apellido, telefono, direccion  } = req.body;

        //Buscar usuario
        const usuario = await Usuario.findByPk(req.usuario.id);

        if(!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }



        //Actualizar campos
        if (nombre !== undefined) usuario.nombre = nombre;
        if (apellido !== undefined) usuario.apellido = apellido;
        if (telefono !== undefined) usuario.telefono = telefono;
        if (direccion !== undefined) usuario.direccion = direccion;
    

        //guardar cambios
        await usuario.save();

        //Respuesta exitosa
        res.json({
            succes: true,
            message: 'Usuario actualizado exitosamente',
            data: {
                usuario: usuario.toJSON()
            }
        });

    } catch (error) {
        console.error('Error en updateMe:', error);
            return res.status(500).json ({
                succes: false,
                message: 'Error al actualizar usuario',
                errors: error.message
            });
        }
    };

    /**
     * cambiar la contraseña del usaurio autenticado
     * permite al usuario cambiar su contraseña
     * require su contraseña actual por seguridad
     * PUT /api/auth/change-password
     */

    const changePassword = async (req, res) => {
        try {
            const { passwordActual, passwordNueva } = req.body;

            //validacion 1 verificar que se proporcionen ambas contraseñas
            if (!passwordActual || !passwordNueva) {
                return res.status(400).json({
                    success: false,
                    message: 'se require contraseña actual y nueva contraseña'
                });
            }
               //validacion 2 verificar que se proporcionen ambas contraseñas
            if (!passwordActual.length < 6 ) {
                return res.status(400).json({
                    success: false,
                    message: 'la contraseña acutual debe tener al menos 6 caracteres'
                });
            }

               //validacion 3 buscar usaurio con password incluido
               const usuario = await Usuario.scope('withPassword').findByPk(req.usuario.id)
            if (!usuario) {
                return res.status(400).json({
                    success: false,
                    message: 'usaurio no encontrado'
                });
            }

               //validacion 4 verificar que la contraseña actual sea correcta
               const passwordValida = await usuario.compararPassword
               (passwordActual);
            if (!passwordValida) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña incorrecta'
                });
            }

            //actualizar contraseña
            usaurio.password = passwordNueva;
            await usuario.save();

            // respuesta exitosa
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

    } catch (error) {
        console.error('error en changePassword', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};

//exportar todos los controladores
module.exports = {
    registrar,
    login,
    getMe,
    updateMe,
    changePassword
};