const jwt = require('jsonwebtoken')

/*
   VERIFICAR TOKEN
   ====================
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


module.exports = {
    verificaToken,
    verificaAdminRole
}