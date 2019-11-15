//Declaracion de variables de forma global

/* PUERTO */
process.env.PORT = process.env.PORT || 3800

/* Entorno */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

/* BASE DE DATOS LOCAL */
let urlDB

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    urlDB = 'mongodb+srv://nekromorfo20:SlXCrcO3JlmrJt0P@cluster0-g7rd1.mongodb.net/cafe'
}

process.env.URLDB = urlDB