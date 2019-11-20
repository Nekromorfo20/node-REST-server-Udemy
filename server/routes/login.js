const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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




module.exports = app