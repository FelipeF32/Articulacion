/**
 * middleware de verificar roles
 * este middleware verifica que el usuario tenga un rol requerido
 * debe usarse despues de middleware de autenticacion 
 */

const esAdministrador = (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // verificar que el rol es administrador
        if (req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado se requiere permisos de administrador'
            });
        }

        // el usuario es administrador continuar
        next();
    } catch (error) {
        console.error('Error en middleware esAdministrador', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
    }
};

/**
 * middleware para verificar si el usuario es cliente 
 */

const esCliente = (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // verificar que el rol es cliente
        if (req.usuario.rol !== 'cliente') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado se requiere permisos de cliente'
            });
        }

        // el usuario es administrador continuar
        next();
    } catch (error) {
        console.error('Error en middleware esCliente', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
    }
};

/**
 * middleware flexible para verificar multiples roles
 * permite verificar varios roles validos
 * util para cuando una ruta tiene varios roles permitidos
 */

const tieneRol = (req, res, next) => {
    return (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // verificar usuario esta en la lista de roles permitidos
        if (req.rolesPermitidos.include (req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
            });
        }

        // el usuario es administrador continuar
        next();
    } catch (error) {
        console.error('Error en middleware tieneRol', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
        }
    };
};

/**
 * middleware para verificar si el usuario accede a sus propios datos
 * verifica que el usuarioid en los parametros coinciden con el usuario autenticado
 */

const esPropioUsuarioOAdmin = (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // los administradores pueden acceder a datos de cualquier usuario
        if (req.usuario.rol === 'administrador') {
            return next();
        }

        // obtener el usuario de los parametros de la ruta
        const usuarioIdParam = req.params.usuarioId || req.params.id;

        //verificar que el usuarioId coincide con el usuario autenticado
        if (parseInt(usuarioIdParam) !== req.usuario) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado no puedes acceder a datos de otros usuarios'
            });
        }
        

        // el usuario accede a sus propios datos continuar
        next();


    } catch (error) {
        console.error('Error en middleware esPropioUsuarioOAdmin', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
    }
};

/**
 * middleware para verificar que el usuario es administrador o auxiliar
 * permite el acceso a usuarios con rol administrtado o auxiliar
 */

const esAdminOAuxiliar = (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // verificar que el rol es administrador o auxiliar
        if (!['administrador', 'auxiliar'].includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado se requiere permisos de administrador o auxliar'
            });
        }

        // el usuario es administrador o auxiliar continuar
        next();
    } catch (error) {
        console.error('Error en middleware esAdminOAuxiliar', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
    }
};

/**
 * middleware para verificar que el usuario es solo administrador no auxiliar
 * bloquea el acceso a operaciones como eliminar
 */

const soloAdministrador = (req, res, next) => {
    try {
        // verificar que existe req.usuario (viene de la autenticacion)
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado deber iniciar sesion primero'
            });
        }

        // verificar que el rol es administrador o auxiliar
        if (req.usuario.rol !== 'administrador') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado solo administrador pueden realizar esta operacion'
            });
        }

        // el usuario es administrador o auxiliar continuar
        next();
    } catch (error) {
        console.error('Error en middleware soloAdministrador', error);
        return res.status(500).json({
            success: 'Error al verificar permisos',
            error: error.message
        });
    }
};

//exportar los middlewares
module.exports = {
    esAdministrador,
    esCliente,
    tieneRol,
    esPropioUsuarioOAdmin,
    esAdminOAuxiliar,
    soloAdministrador
};