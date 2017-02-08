var mongoose = require("mongoose"); //ORM para mongo
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/fotos');

/*
String
Number
Date
Buffer
Boolean
Mixed
Objectid
Array
*/

//Collections: tablas
//Documents: filas

//schema es como una tabla pero dinámica
/*var userSchemaJSON = {
	email: String,
	password: String
};*/
var posibles_valores = ["M", "F"];
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Coloca un email válido"];

//crea el schema
var user_schema = new Schema({
    name: String,
    username: { type: String, required: true, maxlength: [50, "Username muy grande"] },
    password: {
        type: String,
        minlength: [8, "El password es muy corto"],
        validate: {
        	validator: function (p) {
        		return this.password_confirmation == p; //debe retornar un booleano
        	},
        	message: "Las contraseñas no son iguales"
        }
    },
    age: { type: Number, min: [5, "La edad no puede ser menor que 5"], max: [100, "La edad no puede ser mayor que 100"] },
    email: { type: String, required: "El correo es obligatorio", match: email_match },
    /*match para expresiones regulares*/
    date_of_birth: Date,
    sex: { type: String, enum: { values: posibles_valores, message: "Opción no válida" } }
});

//virtuals para validaciones, no se guardan en la bdd
user_schema.virtual('password_confirmation').get(function() {
    return this.p_c;
}).set(function(password) {
    this.p_c = password;
});

//validaciones se hacen a nivel del schema, el error se pasa a la función async mongoose

//crear el modelo, el que se conectará con la bdd
var User = mongoose.model("User", user_schema); //la colección la nombra mongoose en plural: users

module.exports.User = User;
