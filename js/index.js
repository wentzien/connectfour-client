const buttonNewGame = document.getElementById("button-new-game");
const apiUrl = "https://connectfour.wntzn.com/api/games";

buttonNewGame.addEventListener("click", newGame);

async function newGame() {
    let gameData = await (await fetch(apiUrl)).json();
    document.location.href =
        "/game.html?gameId=" + gameData.gameId + "&playerId=" + gameData.playerId;
}
