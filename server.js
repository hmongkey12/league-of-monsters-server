const express = require("express");
const socket = require("socket.io");
const http = require("http");
const List = require("collections/list");
const {abilityEntity, heroEntity } = require("./entities")
const {loadPumpkinAbilities, loadReaperAbilities }  = require("./abilityConfig")
const {handleInput} = require("./utilities")

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
const JUMP_CONSTANT = 10;
const MAX_JUMP_HEIGHT = 100;
const GROUND_Y_POSITION = 0;
const JUMPS_PER_SECOND = 2;

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

		socket.on("createHero", (...args) => {
			if (!gameState.connected.has(socket.id)) {
				const newHero = new heroEntity(args[0]);
				newHero.abilities = loadPumpkinAbilities();
				if (args.has("pumpkin")) {
					newHero.abilities = loadPumpkinAbilities();
				} else if (args.has("reaper")) {
					newHero.abilities = loadReaperAbilities();
				}
				gameState.connected.set(socket.id, newHero);
			}
			io.sockets.emit("heroCreated", socket.id);
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

				if (elapsedJumpingTime >= JUMPS_PER_SECOND) {
					if (gameState.connected.get(socket.id).isJumping) {
						if (gameState.connected.get(socket.id).yPos < MAX_JUMP_HEIGHT) {
							gameState.connected.get(socket.id).yPos += JUMP_CONSTANT;
						} else {
							gameState.connected.get(socket.id).isJumping = false;
							gameState.connected.get(socket.id).isFalling = true;
						}
					} else if (gameState.connected.get(socket.id).isFalling) {
						if (gameState.connected.get(socket.id).yPos > GROUND_Y_POSITION) {
							gameState.connected.get(socket.id).yPos -= JUMP_CONSTANT;
						} else {
							gameState.connected.get(socket.id).yPos = GROUND_Y_POSITION;
							gameState.connected.get(socket.id).isFalling = false;
						}
					}
				}
				io.sockets.emit("updateState", JSON.stringify(gameState));
			}
		});
		socket.on("disconnect", () => {
			console.log("A player has disconnected", socket.id);
			gameState.connected.delete(socket.id);
		});
	});

