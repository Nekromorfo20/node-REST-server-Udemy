const jwt = require('jsonwebtoken')

/*
   VERIFICAR TOKEN
   ====================
   Descripcion: Verifica el token generado mediante jwt en el archivo server/routes/login.js exista, el token permite 
                el consumo de todas las rutas donde sea invocado

   NOTAS:
   ------------------------------------------------------------------------------------------------------------------------
    next()        Esta funcion se ejecuta para continuar el codigo despues de terminar de verificar el middleware
                  continua el codigo del usuario.js
    get('token')  Utilizando el metodo get podemo obtener datos de lo headers de una peticion, accediendo a como fueron
                  llamados, en este caso el token
    verify()      Esta es una funcion de jwt que permite validar un token en una peticion, esta funcion recibe 3 parametros
                  jwt.verifty(<token>, <la SEED o semilla>, funcionCallback() )
      .decoded    Es el cuerpo de los datos enviados encriptados
*/

let verificaToken = (req, res, next) =>{
    let token = req.get('token') //Obteniendo token
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if(error){
            return res.status(401).json({
                ok: false,
                error: {
                    message: 'Token no valido'
                }
            })
        }

        req.usuario = decoded.usuario
        next()
    })
} 


/*
VERIFICA ADMIN ROLE
=====================
Descripcion: Verifica el parametro ROLE de las rutas tipo POST para verificar que solo los usuarios registrados
             como ADMIN pueden borrar, crear y editar la tabla "usuarios"
*/

let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario

    if( usuario.role === 'ADMIN_ROLE'){
        next()
    } else {
        return res.json({
            ok: false,
            error: {
                message: 'El usuario no es administrador'
            }
        })
    }
}

/*
VERIFICA TOKEN PARA LA IMAGEN
=============================
Descripcion: Verifica el token enviado por query params para mostrar la imagen
             este solo aplica para el archivo public/index.html
*/

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token
    jwt.verify(token, process.env.SEED, (error, decoded) => {
        if(error){
            return res.status(401).json({
                ok: false,
                error: {
                    message: 'Token no valido'
                }
            })
        }

        req.usuario = decoded.usuario
        next()
    })
}


module.exports = {
    verificaToken,
    verificaAdminRole,
    verificaTokenImg
}