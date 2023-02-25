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

function extractAbilities(abilities) {
	console.log(abilities)
	return [];
}

function PlayerState() {
	this.heroName = "pumpkin_head"
	this.xPos = 0;
	this.yPos = 0;
	this.isAttacking = false;
	this.isMoving = false;
	this.attackStart = 0;
	this.attackEnd = 0;
	this.jumpStart = 0;
	this.jumpEnd = 0;
	this.isJumping = false;
	this.movingStart = 0;
	this.movingEnd = 0;
	this.facingDirection = "none";
	this.beforeJump = this.yPos;
	this.abilities = [];
}

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

let connectedPlayers = new Map(); 

let gameState = new GameState();

let newGameState = new Map();

const movementSpeed = 5;

io.on("connection", (socket) => {
		console.log("A player has connected", socket.id);
		let connectedPlayerId = socket.id;
		if (!connectedPlayers.has(connectedPlayerId)) {
			connectedPlayers.set(connectedPlayerId);
			const newPlayer = new PlayerState();
			gameState.connected.set(connectedPlayerId, newPlayer);
		}

		socket.on("createPlayer", (...args) => {
			// TODO
			let jsonArgs = JSON.parse(args);
			if (!newGameState.has(socket.id)) {
				const newPlayer = new PlayerState();
				newPlayer.xPos = jsonArgs["xPos"];
				newPlayer.yPos = jsonArgs["yPos"];
				newPlayer.heroName = jsonArgs["heroName"];
				newPlayer.abilities = jsonArgs["abilities"];
				newGameState.set(socket.id, newPlayer);
				// console.log(newGameState)
				// console.log(newPlayer.abilities[0])
			}
			// io.sockets.emit("newState", JSON.stringify(newGameState));
		})



		socket.on("command", (...args) => {
			if (args.includes("left") && !gameState.connected.get(socket.id).isAttacking) {
				gameState.connected.get(socket.id).facingDirection = "left";
				if (gameState.connected.get(socket.id).xPos > 0) {
					gameState.connected.get(socket.id).xPos -= movementSpeed;
				} else {
					gameState.connected.get(socket.id).xPos = 0;
				}
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("right") && !gameState.connected.get(socket.id).isAttacking) {
				gameState.connected.get(socket.id).facingDirection = "right";
				if (gameState.connected.get(socket.id).xPos < 3600) {
					gameState.connected.get(socket.id).xPos += movementSpeed;
				} else {
					gameState.connected.get(socket.id).xPos = 3600;
				}
				gameState.connected.get(socket.id).isMoving = true;
				gameState.connected.get(socket.id).movingStart = Date.now();
			} else if (args.includes("up") && !gameState.connected.get(socket.id).isAttacking && !gameState.connected.get(socket.id).isJumping){
				gameState.connected.get(socket.id).beforeJump = gameState.connected.get(socket.id).yPos;
				gameState.connected.get(socket.id).isJumping = true;
				gameState.connected.get(socket.id).jumpStart = Date.now();
			} else if (args.includes("down") && !gameState.connected.get(socket.id).isAttacking) {
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
			let jumpStart = gameState.connected.get(socket.id).jumpStart;
			let jumpEnd = Date.now();
			let attackEnd = Date.now();
			let movingEnd = attackEnd;
			let movingStart = gameState.connected.get(socket.id).movingStart;
			let elapsedAttackTime = Math.floor((attackEnd - attackStart) / 1000);
			let elapsedMovingTime = Math.floor((movingEnd - movingStart) / 1000);
			let elapsedJumpingTime = Math.floor((jumpEnd - jumpStart) / 1000);
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
			if (gameState.connected.get(socket.id).isJumping && elapsedJumpingTime >= .5) {
				gameState.connected.get(socket.id).isJumping = false;
				gameState.connected.get(socket.id).jumpStart = 0;
				gameState.connected.get(socket.id).jumpEnd = 0;
			} else if (gameState.connected.get(socket.id).isJumping) {
				gameState.connected.get(socket.id).yPos += 5;
			} else if (gameState.connected.get(socket.id).beforeJump <  gameState.connected.get(socket.id).yPos) {
				gameState.connected.get(socket.id).yPos -= 5;
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

