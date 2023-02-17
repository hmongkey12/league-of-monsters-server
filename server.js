const express = require("express");
const socket = require("socket.io");
const http = require("http");
const List = require("collections/list");

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);

app.use(express.static("public"));

const io = socket(server);

function GameState() {
	this.connected = new Map();
}

function PlayerState() {
	this.xPos = 50;
	this.yPos = 50;
}

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

let connectedPlayers = new Map(); 

let gameState = new GameState();

const movementSpeed = 5;

io.on("connection", (socket) => {
		console.log("A player has connected", socket.id);
		console.log("This is the socket that gets sent when connected", socket);
		let connectedPlayerId = socket.id;
		if (!connectedPlayers.has(connectedPlayerId)) {
			connectedPlayers.set(connectedPlayerId);
			const newPlayer = new PlayerState();
			gameState.connected.set(connectedPlayerId, newPlayer);
		}
		socket.on("command", (...args) => {
			if (args.includes("left")) {
				gameState.connected.get(socket.id).xPos -= movementSpeed;
			} else if (args.includes("right")) {
				gameState.connected.get(socket.id).xPos += movementSpeed;
			} else if (args.includes("up")) {
				gameState.connected.get(socket.id).yPos += movementSpeed;
			} else if (args.includes("down")) {
				gameState.connected.get(socket.id).yPos -= movementSpeed;
			}
			// io.sockets.emit("updateState", JSON.stringify(gameState));
		});
		socket.on("getState", () => {
			io.sockets.emit("updatedState", JSON.stringify(gameState));
		})
		socket.on("disconnect", (socket) => {
			let disconnectedPlayerId = socket.id;
			console.log("A player has disconnected", disconnectedPlayerId);
			gameState.connected.delete(disconnectedPlayerId);
			connectedPlayers.delete(disconnectedPlayerId);
			io.sockets.emit("updatedState", JSON.stringify(gameState));
		});
	});


