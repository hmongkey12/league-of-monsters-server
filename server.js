const express = require("express");
const socket = require("socket.io");
const http = require("http");
const List = require("collections/list");
const {abilityEntity, heroEntity } = require("./entities")
const {loadPumpkinAbilities, loadReaperAbilities }  = require("./abilityConfig")
const {handleInput, handleUpdates} = require("./utilities")

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

		socket.on("createHero", (...args) => {
			if (!gameState.connected.has(socket.id)) {
				const newHero = new heroEntity(args[0]);
				newHero.id = socket.id;
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
			handleUpdates(gameState, socket.id);
			io.sockets.emit("updateState", JSON.stringify(gameState));
		});
		socket.on("disconnect", () => {
			console.log("A player has disconnected", socket.id);
			gameState.connected.delete(socket.id);
		});
	});

