import * as colorGen from "./colorGen.js";
import * as colorPick from "./colorPick.js";

const appModeLinks = document.querySelectorAll("a");

window.addEventListener("load", colorGen.genColors);

for (let a of appModeLinks) {
    a.addEventListener("click", e => {
        for (let link of appModeLinks) link.classList.remove("selected");
        e.target.classList.add("selected");
        if (e.target.id === "colorpick") colorPick.pickerContainer.style.left = "0";
        else colorPick.pickerContainer.style.left = "200%";
    });
}
