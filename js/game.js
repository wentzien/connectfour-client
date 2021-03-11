const urlParams = new URLSearchParams(window.location.search);
const buttonInviteLink = document.getElementById("button-invite-link");
buttonInviteLink.addEventListener("click", inviteLink);
const gameMessage = document.getElementById("game-message");
const home = document.getElementById("home");
home.addEventListener("click", navigateToHome);
const playerScore = document.getElementById("player-score");
const opponentScore = document.getElementById("opponent-score");
const gameId = urlParams.get("gameId");
const playerId = urlParams.get("playerId");
const clientUrl = "https://tictactoe.wntzn.com";
const socketUrl = "https://tictactoe.wntzn.com";

let xArea, yArea;
let gameData;
let player;
const SPACE = 5;
let size;
const nextGameButton = `<button class="btn btn-link" onclick="nextGame()">Nächstes Spiel</button>`;

const socket = io(socketUrl);
console.log(socket);

function socketConnection() {


    socket.emit("join", {gameId, playerId});

    socket.on("connect_failed", err => {
        console.log(err);
    });

    socket.on("gameData", data => {
        gameData = data;
        redraw();

        player = playerId === gameData.aPlayerId ? "a" : "b";

        if(player === "a") {
            playerScore.innerText = gameData.aScore;
            opponentScore.innerText = gameData.bScore;
        } else {
            playerScore.innerText = gameData.bScore;
            opponentScore.innerText = gameData.aScore;
        }

        if ((gameData.gameStatus === "aTurn" && player === "a") || (gameData.gameStatus === "bTurn" && player === "b")) {
            gameMessage.innerHTML = "Du bist am Zug.";
            gameMessage.className = "alert alert-warning m-3";
        } else if ((gameData.gameStatus === "aTurn" && player === "b") || (gameData.gameStatus === "bTurn" && player === "a")) {
            gameMessage.innerHTML = "Warte auf Mitspieler...";
            gameMessage.className = "alert alert-primary m-3";
        } else if ((gameData.gameStatus === "aWon" && player === "a") || (gameData.gameStatus === "bWon" && player === "b")) {
            gameMessage.innerHTML = "Du triumphierst! " + nextGameButton;
            gameMessage.className = "alert alert-success m-3";
        } else if (gameData.gameStatus === "bWon" || gameData.gameStatus === "aWon") {
            gameMessage.innerHTML = "Du wurdest besiegt. " + nextGameButton;
            gameMessage.className = "alert alert-danger m-3";

        } else if (gameData.gameStatus === "draw") {
            gameMessage.innerHTML = "Ihr seid wohl gleich gut... " + nextGameButton;
            gameMessage.className = "alert alert-primary m-3";
        }
    });
}

/* p5.js standard setup function */
function setup() {
    socketConnection();
    size = min(windowHeight - 280, windowWidth - 40);
    let renderer = createCanvas(size, size);
    renderer.parent("playing-area");
    xArea = width / 3;
    yArea = height / 3;
    noLoop();
}

function windowResized() {
    size = min(windowHeight - 200, windowWidth - 40);
    resizeCanvas(size, size);
    xArea = width / 3;
    yArea = height / 3;
}

/* The main drawing loop*/
function draw() {
    if (gameData) {
        /* Inner function to draw the Tic Tac Toe board */
        function drawBoard() {
            strokeWeight(1);

            line(0, yArea, height, yArea);
            line(0, 2 * yArea, height, 2 * yArea);

            line(xArea, 0, xArea, width);
            line(2 * xArea, 0, 2 * xArea, width);
        }

        /* Inner Function to draw all player symbols */
        function drawXO() {
            for (let i = 0; i <= 2; i++) {
                for (let j = 0; j <= 2; j++) {
                    if (gameData.board[i][j] === "b") drawX(i, j);
                    if (gameData.board[i][j] === "a") drawO(i, j);
                }
            }
        }

        /* Inner Function to draw a player X symbol */
        function drawX(x, y) {
            strokeWeight(SPACE);
            line(
                x * xArea + SPACE,
                y * yArea + SPACE,
                x * xArea + xArea - SPACE,
                y * yArea + yArea - SPACE
            );

            line(
                x * xArea + SPACE,
                y * yArea + yArea - SPACE,
                x * xArea + xArea - SPACE,
                y * yArea + SPACE
            );
        }

        /* Inner Function to draw a player O symbol */
        function drawO(x, y) {
            strokeWeight(SPACE);
            ellipseMode(CORNER);
            ellipse(
                x * xArea + SPACE,
                y * yArea + SPACE,
                xArea - 2 * SPACE,
                yArea - 2 * SPACE
            );
        }

        // Actual draw function implementation;
        clear();
        drawBoard();
        drawXO();
    }
}

/* Main Action based on user interaction */
function mousePressed() {
    const {gameStatus, aPlayerId, bPlayerId} = gameData;

    if ((gameStatus === "aTurn" && player === "a") || (gameStatus === "bTurn" && player === "b")) {
        let x = Math.floor(mouseX / xArea);
        let y = Math.floor(mouseY / yArea);
        if (x < 3 && y < 3) {
            if (gameData.board[x][y] === 0) {
                gameData.board[x][y] = player;
                gameData.playerId = playerId;
                socket.emit("gameProgress", gameData);
                redraw();
            }
        }
    }
}

function inviteLink() {
    const input = document.createElement("input");
    document.body.appendChild(input);
    let playerKey = player === "a" ? "bPlayerId" : "aPlayerId";
    input.value = clientUrl + "/game.html?gameId=" + gameData.gameId + "&playerId=" + gameData[playerKey];
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
}

function nextGame() {
    gameData.playerId = playerId;
    socket.emit("nextGame", gameData);
}

function navigateToHome() {
    window.location.href = "/";
}