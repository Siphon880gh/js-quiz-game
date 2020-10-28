/**
 * @overview When clicking "View high scores" at the top left, open a Bootstrap modal showing player scores ranked from highest to lowest.
 * 
 */

 function updateRankingModal() {

    // Todo: Review; querySelector works on both document and element
    var modal = document.querySelector("#modal-high-scores");
    var table = modal.querySelector("table");
    var tbody = table.querySelector("tbody");
    var msgBlankScores = modal.querySelector(".msg-blank-scores");
    tbody.innerHTML = ""; // reset HTML

    // Todo: Review; Remember localStorage stores everything as strings
    var playerScores = localStorage.getItem("scores");
    if(playerScores) {

        // TODO: Review; Fundamental; Removing/adding class, similar to $el.removeClass("hidden") and $el.addClass("hidden")
        table.classList.remove("hidden");
        msgBlankScores.classList.add("hidden");

        playerScores = JSON.parse(playerScores);
        playerScores.forEach((playerScore, i)=>{
            var rank = i+1; // human readable index
            var {name, score} = playerScore;

            // TODO: Review; You can concatenate string with +=
            tbody.innerHTML += `<tr>
                <td>${rank}</td>
                <td>${name}</td>
                <td>${score}</td>
            </tr>`;
        });
    } else {
        table.classList.add("hidden");
        msgBlankScores.classList.remove("hidden");
    }
 };
 updateRankingModal();