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
// const clientUrl = config.clientUrl;
const clientUrl = window.location.protocol + window.location.hostname;
const {apiUrl} = config;

let xArea, yArea;
let gameData;
let player;
const SPACE = 5;
let size;
const nextGameButton = `<button class="btn btn-link" onclick="nextGame()">Nächstes Spiel</button>`;

const socket = io(apiUrl);

function socketConnection() {

    socket.emit("join", {gameId, playerId});

    socket.on("connect_failed", err => {
        console.log(err);
    });

    socket.on("gameData", data => {
        gameData = data;
        redraw();

        player = playerId === gameData.aPlayerId ? "a" : "b";

        if (player === "a") {
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
    size = size / 7;
    let renderer = createCanvas(size * 7, size * 6);
    renderer.parent("playing-area");
    xArea = width / 7;
    yArea = height / 6;
    ellipseMode(CORNER);
    noLoop();
}

function windowResized() {
    size = min(windowHeight - 280, windowWidth - 40);
    size = size / 7;
    resizeCanvas(size * 7, size * 6);
    xArea = width / 7;
    yArea = height / 6;
    redraw();
}

/* The main drawing loop*/
function draw() {
    if (gameData) {
        background("black");

        /* Inner function to draw the Tic Tac Toe board */
        function drawBoard() {
            for (let x = 0; x < 7; x++) {
                for (let y = 0; y < 6; y++) {
                    noFill();
                    circle(x * xArea + SPACE, y * yArea + SPACE, xArea - 2 * SPACE);
                }
            }
        }

        /* Inner Function to draw all player symbols */
        function drawSymbols() {
            for (let row = 0; row < 7; row++) {
                for (let line = 0; line < 6; line++) {
                    if (gameData.board[row][line] === "b") {
                        fill("blue");
                        circle(row * xArea + SPACE, line * yArea + SPACE, xArea - 2 * SPACE);
                    } else if (gameData.board[row][line] === "a") {
                        fill("red");
                        circle(row * xArea + SPACE, line * yArea + SPACE, xArea - 2 * SPACE);
                    }
                }
            }
        }

        // Actual draw function implementation
        clear();
        drawBoard();
        drawSymbols();
    }
}

/* Main Action based on user interaction */
function mousePressed() {
    const {gameStatus, aPlayerId, bPlayerId} = gameData;

    if ((gameStatus === "aTurn" && player === "a") || (gameStatus === "bTurn" && player === "b")) {
        let row = Math.floor(mouseX / xArea);
        let rightHeight = Math.floor(mouseY / yArea);
        if (row < 7 && rightHeight < 6) {
            for (let line = 6; line >= 0; line--) {
                if (gameData.board[row][line] === 0) {
                    gameData.board[row][line] = player;
                    gameData.playerId = playerId;
                    gameData.gameStatus = player === "a" ? "bTurn" : "aTurn";
                    socket.emit("gameProgress", gameData);
                    redraw();
                    break;
                }
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