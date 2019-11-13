require('../config/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

//Middlewares, los middlewares se utilizan con el comando use()
//parser application/x-www-fomr-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

//parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) =>{
    res.json('Hello word desde Server REST')
})

app.get('/usuario', (req, res) =>{
    res.json('GET usuario')
})
app.post('/usuario', (req, res) =>{
    let body = req.body
    if(body.nombre === undefined){
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        })
    } else {
        res.json({
            persona: body
        })
    }
})
app.put('/usuario/:id', (req, res) =>{
    let id = req.params.id
    res.json({
        id: id
    })
})
app.delete('/usuario', (req, res) =>{
    res.json('DELETE usuario')
})

app.listen(process.env.PORT, () =>{
    console.log(`Server desplegado en http://localhost:${process.env.PORT}`)
})