import {numInput, playerConfigInput} from "./components.js";
import {playerColors, inputsHeight, fontScale} from "./const.js";

const setupCont = document.querySelector("#setup");
const rulesRadios = document.getElementsByName("rules");
const numRoundsCont = document.querySelector("#numRoundsCont");
const numRoundsInput = document.querySelector("#numRounds");
const debugCb = document.querySelector("#debugCheckbox");
export const startBtn = document.querySelector("#startBtn");

//////

let config;

function toggleRoundNumInput(e) {
    numRoundsCont.style.display = e.target.value === "poker" ? "block" : "none";
}
for (let radio of rulesRadios) radio.addEventListener("change", toggleRoundNumInput);

// init player inputs
const playerConfigInputs = [];
const numPlayersInput = new numInput("numPlayers", "36px", 2, playerColors.length);
numPlayersInput.setLabel("Players: ");
numPlayersInput.setValue(2);
setupCont.insertBefore(numPlayersInput.container, startBtn);
for (let i = 0; i < 2; i++) {
    const input = new playerConfigInput(i + 1);
    playerConfigInputs.push(input);
    setupCont.appendChild(input.container);
}

// add/remove player inputs with numPlayersInput change
// also keep track of unused inputs
function handlePlayerNumChange() {
    const n = numPlayersInput.getValue();
    const numInputs = playerConfigInputs.length;
    if (n > numInputs) {
        // add input(s)
        const d = n - numInputs;
        for (let i = 1; i < d + 1; i++) {
            const newInput = new playerConfigInput(numInputs + i);
            playerConfigInputs.push(newInput);
            setupCont.appendChild(newInput.container);
        }
    } else {
        // just set visibility
        for (let i = 0; i < numInputs; i++)
            playerConfigInputs[i].container.style.visibility = i + 1 > n ? "hidden" : "visible";
    }
}
numPlayersInput.onChange(handlePlayerNumChange);

export function hideAllInputs() {
    for (let i = 0; i < playerConfigInputs.length; i++) playerConfigInputs[i].container.style.visibility = "hidden";
}

export function showInputs() {
    for (let i = 0; i < numPlayersInput.getValue(); i++) {
        playerConfigInputs[i].container.style.visibility = "visible";
    }
}

export function getConfig() {
    const numPlayers = numPlayersInput.getValue();
    const debug = debugCb ? debugCb.checked : false;

    // validate inputs first
    if (!debug) for (let i = 0; i < numPlayers; i++) if (!playerConfigInputs[i].getValues()[0]) return;

    config = {
        rules: null,
        rounds: null,
        players: []
    };
    
    config.rules = document.querySelector("input[type='radio']:checked").value;
    if (config.rules === "poker")
        config.rounds = numRoundsInput.value ? parseInt(numRoundsInput.value) : 5;
    else config.rounds = 14;
    for (let i = 0; i < numPlayers; i++) config.players.push(playerConfigInputs[i].getValues());

    if (debug) {
        config.rounds = 2;
        config.players = [
            ["foo", "#f00"],
            ["bar", "#ba2"]
        ];
    }

    return config;
}
