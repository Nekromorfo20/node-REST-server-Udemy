const express = require('express')
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion')
let app = express()
let Categoria = require('../models/categoria')


//Mostrar todas las categorias
app.get('/categorias', verificaToken, (req, res) => {
    Categoria.find({})
      .sort('descripcion') //Ordena la manera de obtener los resultado de forma ascendente
      .populate('usuario', 'nombre email') //toma la informacion de una tabla y muestra los campos especificados
                                           //en este caso se usa nombre e email para saber quien  creo la categoria
      .exec((error, categorias) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                error
            })
        }

        return res.status(200).json({
            ok: true,
            categorias: categorias
        })
    })

})

//Mostrar una categoria por ID
app.get('/categoria/:id', verificaToken,(req, res) => {
//categoria.findById()
    let id = req.params.id

    Categoria.findById(id, (error, categoriaDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El id no es valido para categorias'
                }
            })
        }

        return res.status(200).json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

//Crear una nueva categoria
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoria
    // req.usuario._id
    let body = req.body

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((error, categoriaDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                error: error
            })
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        })


    })


})

//Actualizar datos de la categoria
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id
    let body = req.body

    let desCategoria = {
        descripcion: body.descripcion
    }

    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (error, categoriaDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                error: error
            })
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

//Actualizar datos de la categoria
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //condicion 1 - que solo la puede borrar un admin, no borrar solo cambia el estado a false
    //Categoria.findByIdAndRemove

    let id = req.params.id
    
    Categoria.findByIdAndRemove(id, (error, categoriaDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El id no existe'
                }
            })
        }

        return res.status(200).json({
            ok: true,
            message: 'Categoria Borrada'
        })
    })
})


module.exports = app