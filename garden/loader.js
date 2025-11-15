const loader = document.querySelector("#loader");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
progressText.textContent = "Loading";

let i = 0;
const a = ["", ".", "..", "..."];
const anim = setInterval(() => {
    if (i > 3) { i = 0; }
    progressText.textContent = "Loading" + a[i];
    i++;
}, 250);

document.body.onload = function () {
    loader.style.display = "none";
    clearInterval(anim);
    //document.documentElement.requestFullscreen();
};