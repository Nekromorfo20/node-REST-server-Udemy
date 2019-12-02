const express = require('express')
const { verificaToken } = require('../middlewares/autenticacion')
const app = express()
let Producto = require('../models/producto')


/* Obtener todos los productos */
app.get('/productos', verificaToken, (req, res) => {
    //traer todos los productos
    //populate: usuario categoria
    //paginado
    let desde = req.query.desde || 0
    desde = Number(desde)
    let hasta = req.query.hasta || 5
    hasta = Number(hasta)

    Producto.find({
        disponible: true
    }, 'nombre precioUni descripcion')
      .populate('usuario', 'nombre email')
      .populate('categoria', 'descripcion')
      .skip(desde)
      .limit(hasta)
      .exec((error, productosDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        return res.status(200).json({
            ok: true,
            productos: productosDB
        })
      })
      

})

/* Obtener un producto por Id */
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id

    Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'nombre')
    .exec((error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El id no es valido para productos'
                }
            })
        }
        return res.status(200).json({
            ok: true,
            producto: productoDB
        })
    })
    
})

/* Crear un nuevo producto */
app.post('/productos', verificaToken, (req, res) => {{
    let body = req.body

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: Number(body.precioUni),
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id //esta implicito en el req, se manda junto con el token
    })

    producto.save((error, productoDB) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            })
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            })
        }
        return res.status(200).json({
            ok: true,
            producto: productoDB
        })
    })
    
}})

/* Buscar un producto */
app.get('/productos/buscar/:termino', verificaToken, (req, res) =>{

    //Se genera la busqueda en base de una expresion regular, con "i" indicamos el include de todo
    let termino = req.params.termino
    let regex = new RegExp(termino, 'i')
    Producto.find({nombre: regex})

      .populate('categoria', 'nombre')
      .exec((error, productos) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        return res.status(200).json({
            ok: true,
            productos: productos
        })
      })
})


/* Actualizar un producto */
app.put('/productos/:id', verificaToken, (req, res) => {
    //grabar el usuario
    let id = req.params.id
    let body = req.body

    Producto.findById(id, (error, productoDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El id no fue encontrado'
                }
            })
        }

        productoDB.nombre = body.nombre
        productoDB.precioUni = body.precioUni
        productoDB.categoria = body.categoria
        productoDB.disponible = body.disponible
        productoDB.descripcion = body.descripcion

        productoDB.save((error, productoGuardado) => {
            if(error){
                return res.status(500).json({
                    ok: false,
                    error: error
                })
            }
            return res.status(200).json({
                ok: true,
                producto: productoGuardado
            })
        })
    })//fin del findById
})

/* Borrar un producto */
app.delete('/productos/:id', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado
    let id = req.params.id
    let cambiadisponible = {
        disponible: false
    }
    
    Producto.findByIdAndUpdate(id, cambiadisponible, {new: true}, (error, productoDB) => {
        if(error){
            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                error:{
                    message: 'Producto no encontrado'
                }
            })
        }
        return res.status(200).json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado'
        })
    })
})

module.exports = app