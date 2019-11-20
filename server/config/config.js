//Declaracion de variables de forma global

/* PUERTO */
process.env.PORT = process.env.PORT || 3800

/* Entorno */
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

/* Vencimiento del TOKEN 
60 segundos
60 minutos
24 horas
30 dias
*/
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30


/* Semilla de autentificacion */
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo'

/* BASE DE DATOS LOCAL */
let urlDB

if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe'
} else {
    // urlDB = 'mongodb+srv://nekromorfo20:SlXCrcO3JlmrJt0P@cluster0-g7rd1.mongodb.net/cafe'
    urlDB = process.env.MONGO_URI
}

process.env.URLDB = urlDB