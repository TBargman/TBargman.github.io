function newE2(parent, type, clas, id) {
    const e = document.createElement(type);
    if (clas) e.className = clas;
    if (id) e.id = id;
    if (parent) parent.appendChild(e);
    return e;
}

export class MinMaxDataSlider {
    color = "#add6ff";
    outlineColor = "#346";
    handleSize = 18; // also affects rail height
    scaleTransform = 1.25;
    cMargin = 8; // margin for collision handling

    _handleSize2 = this.handleSize / 2;
    _handleSize4 = this.handleSize / 4;
    css = `
.container {
    display: flex;
    user-select: none;
}
.main-label {
    font-size: ${this.handleSize};
    text-align: right;
    margin-right: 4px;
}
.rail-cont {
    position: relative;
    width: 100%;
    top: 3px;
    left: ${this._handleSize4}px;
}
.rail {
    height: ${this._handleSize2}px;
    outline: 1px solid ${this.outlineColor};
    &.outer {
        background-color: white;
        border-radius: ${this._handleSize4}px;
        z-index: 1;
    }
    &.inner {
        position: relative;
        background-color: ${this.color};
        z-index: 2;
    }
}
.handle {
    position: absolute;
    top: -${this._handleSize4}px;
    height: ${this.handleSize}px;
    width: ${this.handleSize}px;
    border-radius: 50%;
    outline: 1.5px solid ${this.outlineColor};
    background-color: ${this.color};
    /*background-image: radial-gradient(circle farthest-corner at 35% 23%, #cce5ffff 0%, #add6ffff 100%);
    */z-index: 3;
    transition:
        transform 120ms ease-in-out,
        box-shadow 200ms ease-in-out;
    &.grabbed {
        z-index: 4;
        transform: scale(${this.scaleTransform});
        box-shadow: 0 0 4px black;
    }
}
.handle-label {
    display: inline-block;
    position: relative;
    top: 100%;
    left: ${this._handleSize2}px;
    transform: translate(-50%);
    font-size: ${this._handleSize2 + this._handleSize4}px;
    font-weight: 600;
    transition: top 120ms ease-out;
    &.above {
        top: -100%;
    }
}
`;

    constructor(data) {
        if (!Array.isArray(data)) {
            console.error("MinMaxDataSlider: arg0 (data) is not an array");
            return;
        }
        this.main = document.createElement("div");
        this.data = data;
        this.onChange = null;
        this.min = null;
        this.max = null;
        this._minPos = 0;
        this._maxPos = data.length - 1;
        const shadow = this.main.attachShadow({mode: "closed"});
        const style = document.createElement("style");
        style.innerHTML = this.css;
        shadow.appendChild(style);

        const container = newE2(shadow, "div", "container");
        const railCont = newE2(container, "div", "rail-cont");
        const railOuter = newE2(railCont, "div", "rail outer");
        this._railInner = newE2(railOuter, "div", "rail inner");
        this._handle1 = newE2(railOuter, "div", "handle");
        this._handle2 = newE2(railOuter, "div", "handle");
        this._label1 = newE2(this._handle1, "span", "handle-label");
        this._label2 = newE2(this._handle2, "span", "handle-label");

        // data vars
        let handle1Pos, handle2Pos;
        // drag handling vars
        let railWidth, dragWidth;
        let targetHandle, railOffset, handleOffset, railRect, isDragging;

        this.checkCollision = () => {
            const label1Rect = this._label1.getBoundingClientRect();
            const label2Rect = this._label2.getBoundingClientRect();

            // don't check before labels are rendered
            if (label1Rect.width === 0 || label2Rect.width === 0) return;

            const l1L = label1Rect.left;
            const l1R = l1L + label1Rect.width + this.cMargin;
            const l2L = label2Rect.left;
            const l2R = l2L + label2Rect.width + this.cMargin;
            if (l1R < l2L || l2R < l1L) this._label1.classList.remove("above");
            else this._label1.classList.add("above");
        };

        const touchStart = e => {
            if (e.target === this._handle1 || e.target === this._label1) targetHandle = this._handle1;
            else if (e.target === this._handle2 || e.target === this._label2) targetHandle = this._handle2;
            railRect = railOuter.getBoundingClientRect();
            handleOffset = e.touches[0].clientX - e.target.offsetLeft;
            targetHandle.classList.add("grabbed");
            isDragging = true;
        };
        const touchMove = e => {
            if (isDragging) {
                let pos;
                const cx = e.touches[0].clientX;
                railOffset = cx - railRect.left;

                // move handles
                if (cx > railRect.left) {
                    if (cx < railRect.right - this.handleSize) {
                        if (railOffset % this._snapWidth < this._snapWidth / 2) {
                            // snap left
                            pos = Math.floor(railOffset / this._snapWidth);
                        } else {
                            // snap right
                            pos = Math.ceil(railOffset / this._snapWidth);
                        }
                        targetHandle.style.left = pos * this._snapWidth + "px";
                    } else {
                        // right edge
                        targetHandle.style.left = dragWidth + "px";
                        pos = data.length - 1;
                    }
                } else {
                    // left edge
                    targetHandle.style.left = "0";
                    pos = 0;
                }

                // set pos and labels
                if (targetHandle === this._handle1) {
                    handle1Pos = pos;
                    this._label1.textContent = data[pos];
                }
                if (targetHandle === this._handle2) {
                    handle2Pos = pos;
                    this._label2.textContent = data[pos];
                }
                this.checkCollision();

                // redraw inner rail
                if (this._handle1.offsetLeft < this._handle2.offsetLeft)
                    this._railInner.style.left = this._handle1.offsetLeft + this._handleSize2 + "px";
                else this._railInner.style.left = this._handle2.offsetLeft + this._handleSize2 + "px";
                this._railInner.style.width = Math.abs(this._handle1.offsetLeft - this._handle2.offsetLeft) + "px";
            }
        };
        const touchEnd = e => {
            isDragging = false;
            targetHandle.classList.remove("grabbed");
            targetHandle = null;
            if (handle1Pos < handle2Pos) {
                this._minPos = handle1Pos;
                this._maxPos = handle2Pos;
            } else {
                this._minPos = handle2Pos;
                this._maxPos = handle1Pos;
            }
            this.min = data[this._minPos];
            this.max = data[this._maxPos];
            if (this.onChange) this.onChange();
        };

        // Init
        const last = data.length - 1;

        // Use RAF to get/use railWidth "before" rendering
        // Needed to be able to set width with css externally
        // and still be able to set snapWidth;
        requestAnimationFrame(() => {
            // kinda feels like cheating lmao
            // there's probably a better way to handle this
            railWidth = railOuter.getBoundingClientRect().width;
            dragWidth = railWidth - this.handleSize;
            this._snapWidth = dragWidth / last;
            this._handle2.style.left = `${dragWidth}px`;
            this._handle1.style.left = "0";
            this._railInner.style.left = `${this._handleSize2}px`;
            this._railInner.style.width = `${dragWidth}px`;
        });

        handle1Pos = 0;
        handle2Pos = last;
        this.min = data[0];
        this.max = data[last];
        this._label1.textContent = data[0];
        this._label2.textContent = data[last];

        this._handle1.addEventListener("touchstart", touchStart);
        this._handle2.addEventListener("touchstart", touchStart);
        this._handle1.addEventListener("touchmove", touchMove);
        this._handle2.addEventListener("touchmove", touchMove);
        this._handle1.addEventListener("touchend", touchEnd);
        this._handle2.addEventListener("touchend", touchEnd);
    }

    getDataBetween() {
        return this.data.slice(this._minPos, this._maxPos + 1);
    }

    moveHandlesToPos(pos1, pos2) {
        // move handles and this._railInner
        const left = pos1 < pos2 ? pos1 : pos2;
        const right = left === pos1 ? pos2 : pos1;
        const leftX = left * this._snapWidth;
        const rightX = right * this._snapWidth;
        this._handle1.style.left = `${leftX}px`;
        this._handle2.style.left = `${rightX}px`;
        this._railInner.style.left = `${this._handleSize2 + leftX}px`;
        this._railInner.style.width = `${rightX - leftX}px`;
        this._label1.textContent = this.data[left];
        this._label2.textContent = this.data[right];
        this.checkCollision();
    }

    get minPos() {
        return this._minPos;
    }

    get maxPos() {
        return this._maxPos;
    }
}
