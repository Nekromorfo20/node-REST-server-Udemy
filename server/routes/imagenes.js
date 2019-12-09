const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const { verificaTokenImg } = require('../middlewares/autenticacion')

/*
    Obtener imagen de un usuario o producto
*/
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo //Obtener el tipo (usuario, producto)
    let img = req.params.img //Obtener la imagen

    //Buscar la imagen
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`)

    if(fs.existsSync(pathImagen)){
        res.sendFile(pathImagen)
    } else {
        /* sendFile() Permite mandar archivos como parametro de respuesta */
        //Se retorna el no-image.jpg en caso de no existir la imagen a buscar
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg')
        res.sendFile(noImagePath)
    }

})



module.exports = app