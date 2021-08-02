const buttonNewGame = document.getElementById("button-new-game");
const {apiUrl} = config;

buttonNewGame.addEventListener("click", newGame);

async function newGame() {
    let gameData = await (await fetch(apiUrl + "/api/games")).json();
    document.location.href =
        "/game.html?gameId=" + gameData.gameId + "&playerId=" + gameData.playerId;
}
