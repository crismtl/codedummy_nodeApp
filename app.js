var express = require("express");
var bodyParser = require("body-parser"); //leer parámetros que vienen en el cuerpo de la petición (parsing)
var User = require("./models/user").User; //importante acceder al atributo User con el .
var session = require("express-session"); //librería para usar sessiones
// var cookieSession = require("cookie-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session); //necesita express-session
var http = require("http");
var realtime = require("./realtime");

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session({
    store: new RedisStore({}), //colocar info para conectarse a Redis
    secret: "super ultra secret word"
}); //solo tiene que ver con REDIS, no con nuestro middleware

realtime(server, sessionMiddleware); //para que el mismo usuario que tengamos en express lo padamos tener en socket io

app.use(sessionMiddleware);

app.use("/public", express.static('public')); //.use: para que se use un middleware
app.use(bodyParser.json()); //ayuda a leer parámetros en petición json: application/json
app.use(bodyParser.urlencoded({ extended: true })); //false: no se pueden hacer parsing de objetos, true: parsing de muchas más cosas

app.use(methodOverride("_method"));

/*todo va a correr sobre /app
sobre / no necesitan auth
*/

// app.use(session({
//     secret: "misecreto123",//debe ser unico
//     /*genid: function(req) {
        
//     }*/
//     resave: false,//si se quieres que una sesión se guarde asi no se haga cambios
//     saveUninitialized: false //guarda sesión nueva ?? ._.
// }));
/*app.use(cookieSession({
    name: "session",
    keys: ["llave-1", "llave-2"]
}));*/


/*app.use(formidable.parse({keepExtensions: true, uploadDir: "images"})); // declarando la carpeta en donde se subira la imagen*/
app.use(formidable.parse({ keepExtensions: true })); //tener cuidado con version, formidable mejor que bodyParser?

app.set("view engine", "jade");

app.get("/", function(req, res) {
    console.log(req.session.user_id);
    res.render("index");
});

app.get("/signup", function(req, res) {
    User.find(function(err, doc) {
        console.log(doc);
        res.render("signup");
    });
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/users", function(req, res) {
    /*console.log('Contraseña: ' + req.body.password); //los param están dentro de body
    console.log('Email: ' +req.body.email);*/

    var user = new User({
        email: req.body.email,
        password: req.body.password,
        password_confirmation: req.body.password_confirmation,
        username: req.body.username
    });
    //si ya existe un obj, solo lo actualiza, lo identifica por un _id asignado por mongodb
    /*user.save(function(err, doc) {
        if (err) {
            console.log(String(err));
        }
        res.send("Guardamos tus datos");
    });*/

    //con promises
    user.save().then(function(us) {
        console.log('User gurdado', us);
        res.send("Guardamos el usuario exitosamente");
    }, function(err) {
        console.log(String(err));
        res.send("No pudimos guardar la información");
    });
});

app.post("/sessions", function(req, res) {
    //User.findById("_id", functio(err, docs){})
    // User.find({}, "username email", function (err, docs) {
    User.findOne({ email: req.body.email, password: req.body.password }, function(err, user) {
        req.session.user_id = user._id; //en el store que se guarda esto es un tanto malo para ponerlo en producción. Ocupa mucha memoria. Existen stores para ponerlo en producción
        res.redirect("/app");

    });
});


/*con router*/
//aqu{i va el prefijo bajo el cual va a funcionar todo
app.use("/app", session_middleware);
app.use("/app", router_app);

// app.listen(8080);
server.listen(8080);

