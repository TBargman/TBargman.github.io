import * as colorGen from "./colorGen.js";

const appModeLinks = document.querySelectorAll("a");

let appMode = "gen";

window.addEventListener("load", colorGen.genColors);

for (let a of appModeLinks) {
    a.addEventListener("click", e => {
        for (let link of appModeLinks) link.classList.remove("selected");
        e.target.classList.add("selected");
    });
}
