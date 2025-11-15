import {playerColors, inputsHeight, fontScale} from "./const.js";

export class numInput {
    constructor(id, width, min, max) {
        const padding = "4px";
        const isTouchDevice =
            "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

        this.container = document.createElement("div");
        this.container.className = "numInputCont";
        this.label = document.createElement("label");
        this.label.htmlFor = id;
        this.inputEl = document.createElement("input");
        this.inputEl.id = id;
        this.inputEl.type = "number";
        if (width) this.inputEl.style.width = width;
        if (min) this.inputEl.min = min;
        if (max) this.inputEl.max = max;

        this.label.style.fontSize = inputsHeight * fontScale + "px";
        this.inputEl.style.height = inputsHeight + "px";
        this.inputEl.style.padding = padding;
        this.inputEl.style.border = "1px solid #777";
        this.inputEl.style.borderRadius = "5px";
        this.inputEl.style.boxSizing = "border-box";
        this.inputEl.style.lineHeight = "0";
        this.inputEl.style.margin = "16px 0";
        this.inputEl.style.fontSize = inputsHeight * fontScale + "px";

        this.container.appendChild(this.label);
        this.container.appendChild(this.inputEl);

        this.upBtn = null;
        this.downBtn = null;

        this.changeFunc = null;

        this.onChange = function (f) {
            if (this.changeFunc) {
                this.inputEl.removeEventListener("change", this.changeFunc);
                this.upBtn.removeEventListener("click", this.changeFunc);
                this.downBtn.removeEventListener("click", this.changeFunc);
            }
            this.changeFunc = f;
            this.inputEl.addEventListener("change", this.changeFunc);
            this.upBtn.addEventListener("click", this.changeFunc);
            this.downBtn.addEventListener("click", this.changeFunc);
        };

        this.getValue = function () {
            return this.inputEl.value;
        };

        this.setValue = function (x) {
            this.inputEl.value = x;
        };

        this.setLabel = function (str) {
            this.label.textContent = str;
        };

        const validate = e => {
            let v = parseInt(this.inputEl.value);
            if (max) if (v > max) v = max;
            if (min) if (v < min) v = min;
            this.inputEl.value = v;
            if (this.changeFunc) this.changeFunc();
        };

        this.inputEl.addEventListener("blur", validate);

        if (isTouchDevice) {
            // inc/dec buttons
            // &#9650; &#9660;
            // &#x25B4; &#x25BE
            this.upBtn = document.createElement("button");
            this.upBtn.type = "button";
            this.upBtn.innerHTML = "&#x25B4;";
            this.upBtn.style.height = inputsHeight + "px";
            this.upBtn.style.aspectRatio = 1;
            this.upBtn.style.border = "1px solid #777";
            this.upBtn.style.borderRadius = "5px";
            this.upBtn.style.padding = padding;
            this.upBtn.style.boxSizing = "border-box";
            this.upBtn.style.lineHeight = "0";
            this.upBtn.style.fontSize = inputsHeight * fontScale + "px";

            this.downBtn = document.createElement("button");
            this.downBtn.type = "button";
            this.downBtn.innerHTML = "&#x25BE;";
            this.downBtn.style.height = inputsHeight + "px";
            this.downBtn.style.aspectRatio = 1;
            this.downBtn.style.border = "1px solid #777";
            this.downBtn.style.borderRadius = "5px";
            this.downBtn.style.padding = padding;
            this.downBtn.style.boxSizing = "border-box";
            this.downBtn.style.lineHeight = "0";
            this.downBtn.style.fontSize = inputsHeight * fontScale + "px";

            this.container.appendChild(this.upBtn);
            this.container.appendChild(this.downBtn);

            const handleUp = e => {
                let v = parseInt(this.inputEl.value);
                if (isNaN(v)) v = min ? min : 1;
                else if (max) {
                    if (v < max) v++;
                } else v++;
                this.inputEl.value = v;
            };
            const handleDown = e => {
                let v = parseInt(this.inputEl.value);
                if (isNaN(v)) v = min ? min : 0;
                else if (min) {
                    if (v > min) v--;
                } else v--;
                this.inputEl.value = v;
            };

            this.upBtn.addEventListener("click", handleUp);
            this.downBtn.addEventListener("click", handleDown);
        }
    }
}

export class PresetColorPicker {
    constructor(colorArr, changeFunc) {
        // setup elements
        this.selected = playerColors[0]; // set default
        this.onChange = changeFunc;
        this.inputElement = document.createElement("div");
        this.inputElement.className = "color-picker";
        this.inputElement.style.backgroundColor = playerColors[0];

        this.picker = document.createElement("div");
        this.picker.className = "picker-overlay transparent";
        this.picker.style.visibility = "hidden";
        this.picker.header = document.createElement("h2");
        this.picker.header.textContent = "Choose your color:";
        this.picker.window = document.createElement("div");
        this.picker.window.className = "picker-window window-hidden";
        this.picker.window.appendChild(this.picker.header);
        this.picker.appendChild(this.picker.window);

        const style = document.createElement("style");

        const numColors = colorArr.length;
        const gridSize = Math.ceil(Math.sqrt(numColors));

        this.inputElement.appendChild(style);
        this.inputElement.appendChild(this.picker);

        style.innerHTML = `
h2 {
    text-align: center;
    color: white;
    grid-column: 1 / ${gridSize + 2};
}
.picker-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9000;
    transition: background-color 250ms ease;
}
.transparent {
    background-color: transparent;
}
.picker-window {
    z-index: 9001;
    position: fixed;
    inset: 70% 0 0 0;
    padding: 0 5% 5%;
    border: 2px solid black;
    border-radius: 20px 20px 0 0;
    background-color: #333;
    
    display: grid;
    grid-template-rows: repeat(${gridSize - 2}, 1fr);
    grid-template-columns: repeat(${gridSize + 1}, 1fr);
    column-gap: 3%;
    row-gap: 5%;
    transform: translateY(0);
    transition: transform 250ms ease;
}
.window-hidden {
    transform: translateY(101%);
}
.color-choice {
    aspect-ratio: 1;
    border: 2px solid white;
    outline: 2px solid black;
    border-radius: 5px;
}
`;

        // add color choices
        for (let color of colorArr) {
            const thisColor = document.createElement("div");
            thisColor.className = "color-choice";
            thisColor.style.backgroundColor = color;
            this.picker.window.appendChild(thisColor);
        }

        // events
        const handleClicks = e => {
            e.stopPropagation();
            const t = e.target;
            if (t.className !== "picker-window") {
                // close window
                hideWindow();
                if (t.className === "color-choice") {
                    // clicked a color
                    this.selected = t.style.backgroundColor;
                    this.inputElement.style.backgroundColor = this.selected;
                    if (this.onChange) this.onChange();
                }
            }
        };

        const hideWindow = () => {
            const end = () => {
                this.picker.style.visibility = "hidden";
                this.picker.removeEventListener("transitionend", end);
            };
            this.picker.addEventListener("transitionend", end);
            this.picker.classList.add("transparent");
            this.picker.window.classList.add("window-hidden");
        };

        const showWindow = e => {
            const hidden = this.picker.classList.contains("transparent");
            if (hidden && e.target.className === "color-picker") {
                this.picker.style.visibility = "visible";
                this.picker.classList.remove("transparent");
                this.picker.window.classList.remove("window-hidden");
            }
        };

        this.picker.addEventListener("click", handleClicks);
        this.inputElement.addEventListener("click", showWindow);
    }

    setHeaderText(text) {
        this.picker.header.textContent = text;
    }
}

export class playerConfigInput {
    constructor(id) {
        this.container = document.createElement("div");
        this.container.className = "playerInput";
        this.label = document.createElement("label");
        this.label.htmlFor = "playerNameInput" + id;
        this.label.textContent = "Player " + id + ": ";
        this.textInput = document.createElement("input");
        this.textInput.id = "playerNameInput" + id;
        this.textInput.type = "text";
        this.textInput.className = "playerName-input";
        this.colorPicker = new PresetColorPicker(playerColors);

        const shadow = this.container.attachShadow({mode: "closed"});

        const style = document.createElement("style");
        style.textContent = `
label {
    font-size: ${inputsHeight * fontScale}px;
    text-align: right;
    margin: 0 6px 0 auto;
    line-height: 170%;
}
input[type="text"] {
    height: ${inputsHeight + 1}px;
    font-size: ${inputsHeight * fontScale}px;
    box-sizing: border-box;
    border: 1px solid #777;
    border-radius: 5px;
}
.color-picker {
    display: inline-block;
    position: relative;
    top: 2px;
    width: 23px;
    height: 23px;
    border: 2px solid white;
    outline: 2px solid black;
    border-radius: 3px;
    margin: 0 20px 0 8px;
}`;

        shadow.appendChild(style);
        shadow.appendChild(this.label);
        shadow.appendChild(this.textInput);
        shadow.appendChild(this.colorPicker.inputElement);
    }

    getValues() {
        return [this.textInput.value, this.colorPicker.selected];
    }
}

export class playerScoreDisp {
    constructor(name, color) {
        this.container = document.createElement("div");
        this.container.className = "playerScore";
        this.playerName = document.createElement("span");
        this.playerName.style.color = color;
        this.playerName.innerHTML = name;
        this.score = document.createElement("span");
        this.score.textContent = ": 0";
        this.container.appendChild(this.playerName);
        this.container.appendChild(this.score);
    }
    setScore(x) {
        this.score.textContent = ": " + x;
    }
    setWinner() {
        this.playerName.classList.add("winner");
    }
    unsetWinner() {
        this.playerName.classList.remove("winner");
    }
}
