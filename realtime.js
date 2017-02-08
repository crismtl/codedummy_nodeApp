module.exports = function(server, sessionMiddleware) {
	//una vez que empieza a fncionar socket.io se lo debe config en el cliente http://localhost:8080/socket.io/socket.io.js
	var io = require("socket.io")(server); //server instancia de http, mas no de express
	var redis = require("redis");
	var client = redis.createClient();

	client.subscribe("images");

	io.use(function(socket, next) {
		sessionMiddleware(socket.request, socket.request.res, next); //configurar socket para que use las mismas sessions
	});

	client.on("message", function(channel, message) {
		console.log("Recibimos un mensaje del canal: " + channel);
		console.log(message);
		if(channel=="images") {
			io.emit("new image", message); //mandar mensaje a todos los suscritos
		}
	});

	io.sockets.on("connection", function(socket) {
		console.log("Socket user: ", socket.request.session.user_id);
	});
}