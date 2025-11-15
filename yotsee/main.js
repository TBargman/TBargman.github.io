import {loadImg, newImg, wait} from "./utility.js";
import * as setup from "./setup.js";
import {playerScoreDisp} from "./components.js";
import {b64, strings} from "./const.js";

let rules; // poker | classic
let numPlayers;
let numRounds;
let players;
let currentPlayer;
let currentRound;
let rollsThisTurn;
let scoreType;
let timesRolled; // for animation

const scoreVals = {
    poker: {
        "pair": 10,
        "twoPair": 20,
        "3oak": 20,
        "4oak": 40,
        "fullHouse": 30,
        "smStr": 30,
        "lgStr": 40,
        "5oak": 50
    },
    classic: {}
};

const dice = [
    {val: 0, hold: false},
    {val: 0, hold: false},
    {val: 0, hold: false},
    {val: 0, hold: false},
    {val: 0, hold: false}
];

// cache imgs
const dieIcons = [
    loadImg(b64[0]),
    loadImg(b64[1]),
    loadImg(b64[2]),
    loadImg(b64[3]),
    loadImg(b64[4]),
    loadImg(b64[5]),
    loadImg(b64[6])
];

//////

const setupCont = document.querySelector("#setup");
const headerEl = document.querySelector("#header");
const rollNumEl = document.querySelector("#rollNum");
const diceCont = document.querySelector("#diceCont");
const rollBtn = document.querySelector("#rollBtn");
const endTurnBtn = document.querySelector("#endBtn");
const scoresEl = document.querySelector("#scores");
const endGameBtnCont = document.querySelector("#endGameBtnCont");
const backBtn = document.querySelector("#backBtn");
const resetBtn = document.querySelector("#resetBtn");
let diceImgEls;

//////

function newPlayer(id, name, color) {
    const player = {
        id: id,
        name: name,
        color: color,
        _points: 0,
        scoreDisp: new playerScoreDisp(name, color),
        set score(x) {
            this._points = x;
            this.scoreDisp.setScore(x);
        },
        get score() {
            return this._points;
        }
    };
    player.setWinner = player.scoreDisp.setWinner.bind(player.scoreDisp);
    player.unsetWinner = player.scoreDisp.unsetWinner.bind(player.scoreDisp);
    return player;
}

function handleDieClick(e) {
    const el = e.target;
    const id = el.id;
    if (dice[id].val === 0) return;
    const held = dice[id].hold;
    dice[id].hold = held ? false : true;
    el.className = held ? "die" : "die held";
}

function roll() {
    if (rollsThisTurn < 3) {
        const canRoll = [];
        for (let die of dice) if (!die.hold) canRoll.push(1);
        if (canRoll.length === 0) return;
        rollsThisTurn++;
        rollNumEl.textContent = "Roll " + rollsThisTurn;

        timesRolled = 0;
        const animate = () => {
            if (timesRolled < 20) {
                endTurnBtn.disabled = true;
                rollBtn.disabled = true;
                for (let die of dice) if (!die.hold) die.val = Math.ceil(Math.random() * 6);
                for (let i = 0; i < 5; i++) diceImgEls[i].src = dieIcons[dice[i].val].src;
                timesRolled++;
                wait(50);
                requestAnimationFrame(animate);
            } else {
                endTurnBtn.disabled = false;
                rollBtn.disabled = false;
                scoreType = getDiceScore();
                rollNumEl.textContent = "Roll " + rollsThisTurn + ": " + strings[scoreType];
            }
        };
        requestAnimationFrame(animate);
        if (rollsThisTurn === 3) rollBtn.disabled = true;
    }
}

function sortedDiceVals() {
    return dice.map(x => x.val).sort();
}

function getDiceScore() {
    const vals = sortedDiceVals();
    const noDups = [];
    for (let v of vals) if (!noDups.includes(v)) noDups.push(v);

    // check for straights
    let consec = 1;
    for (let i = 0; i < noDups.length - 1; i++)
        if (noDups[i + 1] === noDups[i] + 1) consec++;
        else consec = 1;
    if (consec === 4) return "smStr";
    if (consec === 5) return "lgStr";

    // everything else
    const counts = {};
    for (let v of vals)
        if (v in counts) counts[v]++;
        else counts[v] = 1;

    switch (noDups.length) {
        case 1:
            return "5oak";
        case 2:
            // 4oak or fh
            for (let k of Object.keys(counts))
                if (counts[k] === 2 || counts[k] === 3) return "fullHouse";
                else return "4oak";
        case 3:
            // 3oak, 2 pair
            let is3oak = false;
            for (let k of Object.keys(counts)) if (counts[k] === 3) is3oak = true;
            return is3oak ? "3oak" : "twoPair";
        case 4:
            return "pair";
        case 5:
            return "high";
    }
}

function endTurn() {
    // add to player's score
    const scoreType = getDiceScore();
    const points = scoreType === "high" ? sortedDiceVals().at(-1) : scoreVals[rules][scoreType];
    const p = players[currentPlayer];
    p.score = p.score + points;
    rollBtn.disabled = false;

    // continue to next player/round
    if (currentRound < numRounds + 1) {
        if (currentPlayer + 1 === numPlayers) {
            currentPlayer = 0;
            currentRound++;
        } else currentPlayer++;

        endTurnBtn.disabled = true;
        rollNumEl.innerHTML = "&nbsp;";
        rollsThisTurn = 0;
        for (let d = 0; d < 5; d++) {
            dice[d].val = 0;
            dice[d].hold = false;
            diceImgEls[d].className = "die";
            diceImgEls[d].src = dieIcons[0].src;
        }
        updateHeader();
    }

    // game over
    if (currentRound === numRounds + 1) {
        let winner = null;
        let highScore = 0;
        for (let p of players) {
            if (p.score > highScore) {
                highScore = p.score;
                winner = p;
            }
        }
        // check for a tie
        const scoreDups = players.filter(p => p.score === highScore);
        if (scoreDups.length > 1) {
            winner = null;
            for (let p of scoreDups) p.setWinner();
        } else winner.setWinner();

        endGameBtnCont.style.visibility = "visible";
        updateHeader(winner);
    }
}

function updateHeader(player) {
    if (currentRound > numRounds) {
        // game over
        if (player) {
            headerEl.classList.add("winner");
            headerEl.textContent = `${player.name} wins!`;
        } else headerEl.textContent = "Tie!";
        return;
    }
    if (!player) player = players[currentPlayer];
    const span = `<span style="color: ${player.color}">${player.name}</span>`;
    headerEl.innerHTML = `Round ${currentRound} of ${numRounds}: ${span}`;
}

function init(config) {
    players = [];
    scoresEl.innerHTML = "";
    rules = config.rules;
    numPlayers = config.players.length;
    numRounds = config.rounds;

    // init players
    for (let i = 0; i < numPlayers; i++) {
        const [name, color] = config.players[i];
        const p = newPlayer(i, name, color);
        scoresEl.appendChild(p.scoreDisp.container);
        players.push(p);
    }

    // create empty dice icons
    if (!document.querySelectorAll(".die").length) {
        for (let i = 0; i < 5; i++) {
            const die = newImg(dieIcons[0].src, "die");
            die.id = i;
            diceCont.appendChild(die);
        }

        diceImgEls = document.querySelectorAll(".die");
        for (let el of diceImgEls) {
            el.addEventListener("click", handleDieClick);
        }
    }

    resetGame();
}

function resetGame() {
    for (let p of players) {
        p.score = 0;
        p.unsetWinner();
    }
    currentPlayer = 0;
    rollsThisTurn = 0;
    currentRound = 1;
    headerEl.classList.remove("winner");
    endGameBtnCont.style.visibility = "hidden";
    updateHeader();
}

function backToSetup() {
    setupCont.style.visibility = "visible";
    setup.showInputs();
}

setup.startBtn.addEventListener("click", () => {
    const config = setup.getConfig();

    if (config) {
        setup.hideAllInputs();
        setupCont.style.visibility = "hidden";
        init(config);
        console.log(config);
        console.log(players);
    } else {
        console.warn("Game setup incomplete");
    }
});

rollBtn.addEventListener("click", roll);
endTurnBtn.addEventListener("click", endTurn);

backBtn.addEventListener("click", backToSetup);
resetBtn.addEventListener("click", resetGame);
