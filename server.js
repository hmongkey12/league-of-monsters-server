const express = require("express");
const socket = require("socket.io");
const http = require("http");

const app = express();
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);

app.use(express.static("public"));

const io = socket(server);

function GameState() {
	this.xPos = 0;
	this.yPos = 0;
}

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

var gameState = new GameState();

io.on("connection", (socket) => {
		console.log("A player has connectted", socket.id);
		socket.on("command", (...args) => {
			if (args.includes("left")) {
				gameState.xPos -= 1;
			}
			else if (args.includes("right")) {
				gameState.xPos += 1;
			} else if (args.includes("up")) {
				gameState.yPos += 1;
			} else if (args.includes("down")) {
				gameState.yPos -= 1;
			}
			socket.emit("updateState", JSON.stringify(gameState));
		});
	});


