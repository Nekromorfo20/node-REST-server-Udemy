require('./config/config')
const express = require('express')
const app = express()
const path = require('path')

const mongoose = require('mongoose') 
const bodyParser = require('body-parser')

//Middlewares, los middlewares se utilizan con el comando use()
//parser application/x-www-fomr-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

//parse application/json
app.use(bodyParser.json())

//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')))

//imporando todas las rutas de usuarios/usuario.js
app.use(require('./routes/index'))

mongoose.connect(process.env.URLDB,
    { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology:true },
    (error, res) => {
    if(error) throw new Error
    console.log('Se conecto a la base de datos Cafe!!')
})

//Depliege en el puerto
app.listen(process.env.PORT, () =>{
    console.log(`Server desplegado en http://localhost:${process.env.PORT}`)
})