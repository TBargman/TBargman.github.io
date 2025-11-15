import {rndRGB, rgb2hex, rgb2hsl} from "./colorfuncs.js";

const input_codeType = document.querySelector("#codeType");
const input_numColors = document.querySelector("#numColors");
export const colorCont = document.querySelector("#gen-colorContainer");

export function genColors() {
    const n = parseInt(input_numColors.value);
    const colorBoxes = document.querySelectorAll(".colorBox");
    if (n === colorBoxes.length) {
        // don't clear container, just update box values
        // (to allow for css transitions)
        for (let box of colorBoxes) {
            box.rgbVal = rndRGB();
            box.hexVal = rgb2hex(box.rgbVal);
            box.hslVal = rgb2hsl(box.rgbVal);
            box.style.backgroundColor = box.hexVal;
        }
    } else {
        colorCont.innerHTML = "";
        for (let i = 0; i < n; i++) {
            const box = document.createElement("div");
            box.rgbVal = rndRGB();
            box.hexVal = rgb2hex(box.rgbVal);
            box.hslVal = rgb2hsl(box.rgbVal);
            box.className = "colorBox";
            box.style.backgroundColor = box.hexVal;
            box.style.height = 100 / n + "%";
            colorCont.appendChild(box);
        }
    }
    setColorText();
}

function setColorText() {
    const colorBoxes = document.querySelectorAll(".colorBox");
    switch (input_codeType.value) {
        case "rgb":
            for (let div of colorBoxes)
                div.textContent = "rgb(" + div.rgbVal[0] + " " + div.rgbVal[1] + " " + div.rgbVal[2] + ")";
            break;
        case "hsl":
            for (let div of colorBoxes)
                div.textContent = "hsl(" + div.hslVal[0] + " " + div.hslVal[1] + "% " + div.hslVal[2] + "%)";
            break;
        case "hex":
            for (let div of colorBoxes) div.textContent = div.hexVal.toUpperCase();
            break;
    }
}

document.querySelector("#genBtn").addEventListener("click", genColors);
input_codeType.addEventListener("change", setColorText);