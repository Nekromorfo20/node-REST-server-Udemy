const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//Variables de configuracion de Google SingIn
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario')

app.post('/login', (req, res) => {
    let body = req.body

    //.findOne()    Este es un metodo de mongoose el cual trae  unicamente un  valor segun una serie de parametros {}
    Usuario.findOne({email: body.email}, (error, usuarioDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                message: 'Usuario! o contraseña incorrectos'
            })
        }

        //.compareSync()    Se compara el password enviado por el body de la peticion, convertido con bcrypt con el de la BD
        if( !bcrypt.compareSync( body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok: false,
                message: 'Usuario o contraseña! incorrectos'
            })
        }

        /*
            jwt.sing()    con Jsonwebtoken podemos utilizar el metodo sing, este nos permite codificar nuestros token bajo
                          una semilla (SEED) que funciona como la firma de encriptacion, este se utiliza:
                          sing({ <payload o cuerpo del mensaje> }, <SEED, { expiresIn: <tiempo de expiracion en segundos> }> )
        */
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        return res.json({
            ok: true,
            Usuario: usuarioDB,
            token: token
        })
    })
})

//Configuraciones de Google, funcion para verificar el token creado de google
//Revisar:   https://developers.google.com/identity/sign-in/web/backend-auth
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }


app.post('/google', async(req, res) => {
    let token = req.body.idtoken //se obtiene el toquen al enviar la peticion

    let googleUser = await verify(token)
      .catch(error => {
          return res.status(403).json({
              ok: false,
              error: error
          })
      })

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if(usuarioDB){
            if(usuarioDB.google === false){
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe de usar su autentificacion normal',
                    }
                })
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                })
            }
        } else {
            //si el usuario no existe en MongoDB
            let usuario = new Usuario()
            usuario.nombre = googleUser.nombre
            usuario.email = googleUser.email
            usuario.img = googleUser.img
            usuario.google = true
            usuario.password = ':)'

            usuario.save((error, usuarioDB) => {
                if(error){
                    return res.status(500).json({
                        ok: false,
                        error: error
                    })
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                })

            })
        }
    })

})



module.exports = app