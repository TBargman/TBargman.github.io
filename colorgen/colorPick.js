export const pickerContainer = document.querySelector("#pickerContainer");
const preview = document.querySelector("#colorPreview");

const ColorSliders = {
    mode: null,
    sliders: {},
    get values() {
        const vals = [];
        for (let i = 0; i < this.mode.length; i++) vals.push(this.sliders[this.mode[i]].value);
        return vals;
    },
    init: function (mode) {
        this.mode = mode;
        for (let i = 0; i < mode.length; i++) this.sliders[mode[i]] = new ColorSlider(mode[i]);
    },
    setColor: function (vals) {
        for (let i = 0; i < vals.length; i++) this.sliders[this.mode[i]].value = vals[i];
    },
    updateSliders: function (vals) {
        for (let s in this.sliders) this.sliders[s].updateSliderColors(vals);
        preview.style.backgroundColor = `${this.mode}(${vals[0]} ${vals[1]} ${vals[2]})`;
    }
};

class ColorSlider {
    constructor(mode, initValue) {
        this.mode = mode[0];
        this._value = 0;
        this._mult = "rgb".includes(this.mode) ? 255 : "sl".includes(this.mode) ? 100 : 360;

        this.rail = document.createElement("div");
        this.handle = document.createElement("div");
        this.rail.className = "slider rail";
        this.handle.className = "slider handle";
        this.rail.appendChild(this.handle);
        this.borders = 2;

        let dragging = false;
        let touchOffset, handleOffset, railBox, handleBox, handlePos;

        const handleTouchstart = e => {
            dragging = true;
            railBox = this.rail.getBoundingClientRect();
            handleBox = this.handle.getBoundingClientRect();
            touchOffset = e.touches[0].clientX - handleBox.left;
            handleOffset = e.touches[0].clientX - this.handle.offsetLeft;
        };
        const handleTouchmove = e => {
            if (dragging) {
                handlePos = (this.handle.offsetLeft + this.borders) / (railBox.width - handleBox.width);
                if (e.touches[0].clientX - touchOffset > railBox.left) {
                    // within left boundary
                    if (e.touches[0].clientX + (handleBox.width - touchOffset) < railBox.right)
                        // within right boundary; can move
                        this.handle.style.left = e.touches[0].clientX - handleOffset;
                    else this.handle.style.left = railBox.width - handleBox.width - this.borders + "px";
                } else this.handle.style.left = -this.borders + "px";

                this._value = this._mult * handlePos;
                this.handle.classList.add("dragging");
                ColorSliders.updateSliders(ColorSliders.values);
            }
        };
        const handleTouchend = e => {
            dragging = false;
            this.handle.classList.remove("dragging");
        };

        this.rail.addEventListener("touchstart", handleTouchstart);
        this.rail.addEventListener("touchmove", handleTouchmove);
        this.rail.addEventListener("touchend", handleTouchend);
    }

    updateSliderColors([v1, v2, v3]) {
        this.handle.style.backgroundColor = "hsl".includes(this.mode)
            ? `hsl(${v1} ${v2} ${v3})`
            : `rgb(${v1} ${v2} ${v3})`;
        switch (this.mode) {
            case "h":
                let str = "";
                for (let n = 0; n < 7; n++) str += `, hsl(${n * 60} ${v2} ${v3})`;
                this.rail.style.backgroundImage = `linear-gradient(90deg${str})`;
                break;
            case "s":
                this.rail.style.backgroundImage = `linear-gradient(90deg, hsl(${v1} 0 ${v3}), hsl(${v1} 100 ${v3}))`;
                break;
            case "l":
                this.rail.style.backgroundImage = `linear-gradient(90deg, hsl(${v1} ${v2} 0), hsl(${v1} ${v2} 50), hsl(${v1} ${v2} 100))`;
                break;
            case "r":
                this.rail.style.backgroundImage = `linear-gradient(90deg, rgb(0 ${v2} ${v3}), rgb(255 ${v2} ${v3}))`;
                break;
            case "g":
                this.rail.style.backgroundImage = `linear-gradient(90deg, rgb(${v1} 0 ${v3}), rgb(${v1} 255 ${v3}))`;
                break;
            case "b":
                this.rail.style.backgroundImage = `linear-gradient(90deg, rgb(${v1} ${v2} 0), rgb(${v1} ${v2} 255))`;
                break;
        }
    }

    get element() {
        return this.rail;
    }
    get width() {
        return this.rail.style.width;
    }
    set width(w) {
        this.rail.style.width = w;
    }
    get height() {
        return this.rail.style.height;
    }
    set height(h) {
        this.rail.style.height = h;
        this.handle.style.height = h;
    }
    set value(x) {
        this._value = x;
        const railBox = this.rail.getBoundingClientRect(),
            handleBox = this.handle.getBoundingClientRect(),
            handlePos = this._value / this._mult;
        this.handle.style.left = (this._value / this._mult) * (railBox.width - handleBox.width) - 2;
        ColorSliders.updateSliders(ColorSliders.values);
    }
    get value() {
        return this._value;
    }
}

ColorSliders.init("hsl");

let c = 0;
for (let s in ColorSliders.sliders) {
    pickerContainer.appendChild(ColorSliders.sliders[s].element);
    ColorSliders.sliders[s].element.style.top = 60 + c * 14 + "vmin";
    c++;
}
ColorSliders.setColor([200, 90, 60]);
