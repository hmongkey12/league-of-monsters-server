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
	this.isAttacking = false;
	this.isMoving = false;
	this.attackStart = 0;
	this.attackEnd = 0;
	this.movingStart = 0;
	this.movingEnd = 0;
}

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

let connectedPlayers = new Map(); 

let gameState = new GameState();

const movementSpeed = 5;

io.on("connection", (socket) => {
		console.log("A player has connected", socket.id);
		let connectedPlayerId = socket.id;
		if (!connectedPlayers.has(connectedPlayerId)) {
			connectedPlayers.set(connectedPlayerId);
			const newPlayer = new PlayerState();
			gameState.connected.set(connectedPlayerId, newPlayer);
		}
		socket.on("command", (...args) => {
			if (args.includes("left")) {
				gameState.connected.get(socket.id).xPos -= movementSpeed;
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("right")) {
				gameState.connected.get(socket.id).xPos += movementSpeed;
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("up")) {
				gameState.connected.get(socket.id).yPos += movementSpeed;
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("down")) {
				gameState.connected.get(socket.id).yPos -= movementSpeed;
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("skill_1")) {
				gameState.connected.get(socket.id).isAttacking = true;		
				gameState.connected.get(socket.id).isMoving = false;
				gameState.connected.get(socket.id).attackStart = Date.now();
			}
		});
		socket.on("getState", () => {
			let attackStart = gameState.connected.get(socket.id).attackStart;
			let attackEnd = Date.now();
			let movingEnd = attackEnd;
			let movingStart = gameState.connected.get(socket.id).movingStart;
			let elapsedAttackTime = Math.floor((attackEnd - attackStart) / 1000);
			let elapsedMovingTime = Math.floor((movingEnd - movingStart) / 1000);
			if (gameState.connected.get(socket.id).isAttacking && elapsedAttackTime >= .5) {
				gameState.connected.get(socket.id).isAttacking = false;	
				gameState.connected.get(socket.id).attackStart = 0;
				gameState.connected.get(socket.id).attackEnd = 0;
			}
			if (gameState.connected.get(socket.id).isMoving && elapsedMovingTime >= .5) {
				gameState.connected.get(socket.id).isMoving = false;	
				gameState.connected.get(socket.id).movingStart = 0;
				gameState.connected.get(socket.id).movingEnd = 0;
			}
			io.sockets.emit("updateState", JSON.stringify(gameState));
		});
		socket.on("disconnect", () => {
			let disconnectedPlayerId = socket.id;
			console.log("A player has disconnected", disconnectedPlayerId);
			gameState.connected.delete(disconnectedPlayerId);
			connectedPlayers.delete(disconnectedPlayerId);
		});
	});

