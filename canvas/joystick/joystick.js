"use strict";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
let w = window.innerWidth - 48;
let h = window.innerHeight - 48;
let imageData, data;
const test = document.querySelector("#test");

function trim(input, n) {
    const e = 10 ** n;
    return Math.round(input * e) / e;
}

const pointer = {
    isDown: false,
    x: 0,
    y: 0,
    sx: 0,
    sy: 0
};

const joystick = {
    outerRadius: 48,
    thumbRadius: 20,
    xVal: null,
    yVal: null,
    angle: 0,
    mult: 0
};

function touchStart(e) {
    const t = e.touches[0];
    const ox = t.clientX - t.target.offsetLeft;
    const oy = t.clientY - t.target.offsetTop;
    pointer.x = ox;
    pointer.y = oy;
    pointer.sx = ox;
    pointer.sy = oy;
    joystick.xVal = 0;
    joystick.yVal = 0;
    pointer.isDown = true;
}

function touchMove(e) {
    const t = e.touches[0];
    pointer.x = t.clientX - t.target.offsetLeft;
    pointer.y = t.clientY - t.target.offsetTop;
}

function touchEnd(e) {
    pointer.isDown = false;
}

function color(r, g, b, a) {
    return {r: r, g: g, b: b, a: a ? a : 255};
}

function setPixel(x, y, color) {
    const px = (y * w + x) * 4;
    data[px] = color.r;
    data[px + 1] = color.g;
    data[px + 2] = color.b;
    data[px + 3] = color.a;
}

function initCanvas() {
    canvas.width = w;
    canvas.height = h;
    canvas.style.top = window.innerHeight / 2 - h / 2 + "px";
    canvas.style.left = window.innerWidth / 2 - w / 2 + "px";
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    //w *= dpr;
    //h *= dpr;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    /**/

    imageData = ctx.createImageData(w, h);
    data = imageData.data;

    ctx.fillStyle = "#ffffff66";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.font = "10pt sans-serif";

    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);
}

function update() {
    if (pointer.isDown) {
        let dx = pointer.x - pointer.sx;
        let dy = pointer.y - pointer.sy;
        let dist = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (dist !== 0) {
            test.textContent = `dx: ${trim(dx, 1)} dy: ${trim(dy, 1)}`;
            joystick.xVal = Math.cos(dy / dist);
            joystick.yVal = Math.sin(dx / dist);
            joystick.mult = dist > joystick.outerRadius ? 1 : dist / joystick.outerRadius;
        }
    }
}

function render() {
    update();

    // background
    ctx.fillStyle = "#25313a";
    ctx.fillRect(0, 0, w, h);

    if (pointer.isDown) {
        // outer circle
        ctx.fillStyle = "#ffffff0f";
        ctx.beginPath();
        ctx.arc(pointer.sx, pointer.sy, joystick.outerRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // inner circle
        ctx.beginPath();
        ctx.moveTo(pointer.sx, pointer.sy);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${trim(joystick.mult, 3)}`, 10, h - 26);
    ctx.fillText(`${trim(joystick.xVal, 3)}, ${trim(joystick.yVal, 3)}`, 10, h - 10);
    requestAnimationFrame(render);
}

function main() {
    initCanvas();
    requestAnimationFrame(render);
}

main();
