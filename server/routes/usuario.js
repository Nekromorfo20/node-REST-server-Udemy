const express = require('express')
const app = express()
const Usuario = require('../models/usuario')
const bcrypt = require('bcrypt') //libreria para encriptacion de una sola via, para la contraseña
const _ =require('underscore') //una libreria de complementos de javascript para mejorar ciertas funciones

app.get('/', (req, res) =>{
    res.json('Hello word desde Server REST')
})

app.get('/usuario', (req, res) =>{
    // res.json('GET usuario LOCAL!!')
    /* 
        .skip()    funcion de mongoose que recibe un valor int el cual indica el numero de registro de la BD desde
                   el que va a retornar los datos una consulta
        .limit()   funcion de mongoose que recibe de parametro un valor int el cual indica la cantidad de registros
                   de la BD que va a regresar una consulta
        .find()    Es una funcion de mongoose utilizada para realizar consultas de datos utilizando el Schema, dentro
                   de llaves se puede especificar que datos se van a de otra forma se trae todos
                   Ademas, como segundo parametro de los argumentos se puede especificar los datos que se van a mostrar
        .count()   un funcion de mongoose, que regresa un callback de un contador de dato especificados entre llaves
                   el contador puede ser agregado a una respuesta json()
    */
    let desde = req.query.desde || 0
    desde = Number(desde)
    let limite = req.query.limite || 5
    limite = Number(limite)

    Usuario.find({
        estado: true
    },'nombre email role estado google img')
      .skip(desde)
      .limit(limite)
      .exec((error, usuarios) => {
        if(error){
            return res.status(400).json({
                ok: false,
                error: error
            })
        }

        Usuario.count({ estado: true },(error, conteo) => {
            return res.json({
                ok: true,
                usuarios: usuarios,
                cuantos: conteo
            })
        })

    })
})

app.post('/usuario', (req, res) =>{
    let body = req.body

    //instancia del Schema para aplicar las reglas y validaciones
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    //Guardar un usuario en la BD
    usuario.save((error, usuarioDB) => {
        if(error){
            return res.status(400).json({
                ok: false,
                error: error
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })

})

app.put('/usuario/:id', (req, res) =>{
    let id = req.params.id
    //opciones que si se permiten acutalizar utilizando underscore( _ )
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado'])

    Usuario.findByIdAndUpdate(id, body,{ new:true, runValidators: true, context:'query' }, (error, usuarioDB) => {
        if(error){
            return res.status(400).json({
                ok: false,
                error: error
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })

})
app.delete('/usuario/:id', (req, res) =>{
    let id = req.params.id
    let cambiaEstado = {
        estado: false
    }
    // Usuario.findByIdAndRemove(id, (error, usuarioBorrado) =>{
    Usuario.findByIdAndUpdate(id, cambiaEstado,{ new:true }, (error, usuarioBorrado) => {
        if(error){
            return res.status(400).json({
                ok: false,
                error: error
            })
        }
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    })
})

module.exports = app