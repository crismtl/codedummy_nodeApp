var Imagen = require("../models/imagenes");
var owner_check = require("./image_permission");

module.exports = function(req, res, next) {
    Imagen.findById(req.params.id)
        .populate("creator") //como hacer un join en relacional *pasa toda la info del usuario a la ref que tiene en imagen
        .exec(function(err, imagen) {
            if (imagen != null && owner_check(imagen, req, res)) {
                console.log("Encontré la imagen " + imagen.title + ", Creador: " + imagen.creator);
                res.locals.imagen = imagen;
                next();
            } else {
                res.redirect("/app"); //podría ser un render a 404
            }
        })
}
