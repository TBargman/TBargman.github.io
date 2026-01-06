function newE(parent, type, clas, content) {
    const e = document.createElement(type);
    parent.appendChild(e);
    if (clas) e.className = clas;
    if (content) e.textContent = content;
    return e;
}

export class ToggleBox {
    red = "#ff132b";
    green = "#00cc16";
    time = 120;
    height = 16;
    cssStyle = `
.container {
    display: flex;
    outline: 1x solid blue;
    align-items: center;
    user-select: none;
}
.box {
    box-sizing: border-box;
    background-color: #fff;
    outline: 1px solid #777;
    border-radius: 2px;
    height: ${this.height}px;
    max-width: ${this.height}px;
    aspect-ratio: 1;
    transition: outline ${this.time}ms;
    &.on {
        outline: 2px solid ${this.green};
        background-color: #fff8;
    }
    &.off {
        outline: 2px solid ${this.red};
        background-color: #fff8;
    }
    &::before {
        content: "+";
        position: relative;
        color: ${this.green};
        font-size: 36px;
        top: -105%;
        left: -13%;
        opacity: 0;
        transition: opacity ${this.time}ms;
    }
    &::after {
        content: "_";
        position: relative;
        color: ${this.red};
        font-size: 40px;
        top: -193%;
        left: -130%;
        opacity: 0;
        transition: opacity ${this.time}ms;
    }
}
.on::before, .off::after {
    opacity: 1;
}

.label {
    font-size: ${this.height}px;
    margin-left: 6px;
}
`;
    constructor(parent, label) {
        this._state = "none";
        this.main = newE(parent, "div");
        this._changeFunc = null;
        const shadow = this.main.attachShadow({mode: "open"});
        newE(shadow, "style", null, this.cssStyle);
        const container = newE(shadow, "div", "container");
        this.box = newE(container, "span", "box");
        this.label = newE(container, "span", "label", label ? label : "");

        const toggle = () => {
            this._state = this._state === "none" ? "on" : this._state === "on" ? "off" : "none";
            this.box.className = `box ${this._state}`;
            if (this._changeFunc) this._changeFunc();
        };

        this.box.addEventListener("click", toggle);
        this.label.addEventListener("click", toggle);
    }
    set state(state) {
        this._state = state;
        this.box.className = `box ${state}`;
    }
    get state() {
        return this._state;
    }
    set onChange(func) {
        this._changeFunc = func;
    }
    get onChange() {
        return this._changeFunc;
    }
}
