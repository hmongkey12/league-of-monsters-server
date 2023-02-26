const express = require("express");
const socket = require("socket.io");
const http = require("http");
const List = require("collections/list");
const {abilityEntity, heroEntity } = require("./entities")
const {loadPumpkinAbilities}  = require("./abilityConfig")
const {handleInput} = require("./utilities")

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

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

let connectedPlayers = new Map(); 

let gameState = new GameState();

io.on("connection", (socket) => {
		console.log("A player has connected", socket.id);
		if (!gameState.connected.has(socket.id)) {
			const newHero = new heroEntity("pumpkin");
			newHero.abilities = loadPumpkinAbilities();
			gameState.connected.set(socket.id, newHero);
		}

		socket.on("createPlayer", (...args) => {
			// TODO: create the hero based on the selection
		})

		socket.on("command", (...args) => {
			handleInput(gameState, socket.id, args);
		});

		socket.on("getState", () => {
			if (gameState.connected.get(socket.id) != null ) {
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
			}
		});
		socket.on("disconnect", () => {
			console.log("A player has disconnected", socket.id);
			gameState.connected.delete(socket.id);
		});
	});

