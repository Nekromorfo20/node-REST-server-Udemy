const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const Usuario = require('../models/usuario')
const Producto = require('../models/producto')
const fs = require('fs')
const path = require('path')

// pciones por defecto
app.use(fileUpload({ useTempFiles: true }))

//Crear/Actualizar imagenes mediante el ID de un usuario o producto, las imagenes se guardan /uploads
app.put('/upload/:tipo/:id', function(req, res){
    let tipo = req.params.tipo
    let id = req.params.id

    if(!req.files) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'No se ha seleccionado nungun archivo'
            }
        })
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios']
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        })
    }

    //Obtener archivos
    let archivo = req.files.archivo
    let nombreCortado = archivo.name.split('.')
    let extension = nombreCortado[nombreCortado.length - 1]
    
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']
    
    //Validar extensiones de imagen
    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            error: {
                message: 'Las extesiones permitidas son: ' + extensionesValidas.join(', ')
            }
        })
    }

    //Cambiar el nombre del archivo
    let nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extension}`

    //Mover archivo a su carpeta
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (error) => {
        if(error) return res.status(500).json({
                ok: false,
                error: error
            })

        //En base a el tipo recibido en params se realiza la funcion para cargar imagen de usuario o producto
        switch(tipo){
            case 'usuarios':
                imagenUsuario(id, res, nombreArchivo)
            break
            case 'productos':
                imagenProducto(id, res, nombreArchivo)
            break
            default:
                console.log('No existe el tipo')
                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'No existe el tipo'
                    }
                })
        }

    })
})

function imagenUsuario(id, res, nombreArchivo){
    Usuario.findById(id, (error, usuarioDB) => {
        if(error){
            borraArchivo(nombreArchivo, 'usuarios')

            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        if(!usuarioDB){
            borraArchivo(nombreArchivo, 'usuarios')

            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no existe'
                }
            })
        }

        //Si ya existe la imagen, solo se actualiza
        borraArchivo(usuarioDB.img, 'usuarios')

        usuarioDB.img = nombreArchivo
        usuarioDB.save((error, usuariGuardado) => {
            return res.status(200).json({
                ok: true,
                usuario: usuariGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, res, nombreArchivo){
    Producto.findById(id, (error, productoDB) => {
        if(error){
            borraArchivo(nombreArchivo, 'productos')

            return res.status(500).json({
                ok: false,
                error: error
            })
        }
        if(!productoDB){
            borraArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no existe'
                }
            })
        }

        //Si ya existe la imagen la borra y coloca una nueva con los datos actualizados
        borraArchivo(productoDB.img, 'productos')

        productoDB.img = nombreArchivo
        productoDB.save((error, productoGuardado) => {
            if(error){
                return res.status(500).json({
                    ok: false,
                    message: 'No se logro subir el producto',
                    error: error
                })
            }
            return res.status(200).json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })
    })
}

function borraArchivo(nombreImagen, tipo){
        /* 
           existsSync()  Comprueba que un archivo con un path enviado existe, regresa tru o false
           unlinkSync()  Borrar un archivo del sistema en un path enviado
        */
       let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`) //Busca la imagen
       //Si ya existe la borra
       if(fs.existsSync(pathImagen)){
           fs.unlinkSync(pathImagen)
       }
}

module.exports = app