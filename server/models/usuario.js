const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
}

let Schema = mongoose.Schema

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        required: false,
        default: true
    },
    google: {
        type: Boolean,
        required: false,
        default: false
    }
})

//el metodo toJSON siempre es llamado cuando se requiere imprimir mediante Json
/* esta linea indica que cuando se manda a imprimir un Json de la instancia del Schema
   por ejemplo en la peticion post, la impresion json no mostrara la propiedad password
*/
usuarioSchema.methods.toJSON = function(){
    let user = this
    let userObject = user.toObject()
    delete userObject.password //se quita password del objeto json a imprimir

    return userObject
}

/* Unique validator se uutiliza para admitir tipos de datos validos en un arreglo
   para utilizarse se debe agregar la propiedad "enum" en la propiedad del Schema
   y agregarse como plugin (lo de abajo)
*/
usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser unico' //mensaje de error
})

module.exports = mongoose.model('Usuario', usuarioSchema)