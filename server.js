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

io.on("connection", (socket) => {
		console.log("A player has connected", socket.id);
		let playerId = socket.id;
		if (!connectedPlayers.has(socket.id)) {
			connectedPlayers.set(socket.id);
			const newPlayer = new PlayerState();
			gameState.connected.set(socket.id, newPlayer);	
		}
		socket.on("command", (...args) => {
			if (args.includes("left")) {
				gameState.connected.get(socket.id).xPos -= 1;
			} else if (args.includes("right")) {
				gameState.connected.get(socket.id).xPos += 1;
			} else if (args.includes("up")) {
				gameState.connected.get(socket.id).yPos += 1;
			} else if (args.includes("down")) {
				gameState.connected.get(socket.id).yPos -= 1;
			}
			io.sockets.emit("updateState", JSON.stringify(gameState));
		});
		socket.on("disconnect", (socket) => {
			console.log("A player has disconnected", playerId);
			gameState.connected.delete(playerId);
			connectedPlayers.delete(playerId);
		});
	});


