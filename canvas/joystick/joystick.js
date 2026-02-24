"use strict";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;
let w = window.innerWidth - 48;
let h = window.innerHeight - 48;

const tau = Math.PI * 2;

const player = {
    // just a box lol
    size: 40,
    x: 200,
    y: 200,
    dx: 0,
    dy: 0,
    maxSpeed: 6,
    friction: 1.1
};

const pointer = {
    isDown: false,
    x: 0,
    y: 0,
    sx: 0, // start
    sy: 0,
    vx: 0, // vector
    vy: 0
};

const joystick = {
    outerRadius: 60,
    thumbRadius: 16,
    thumbx: null,
    thumby: null,
    xVal: 0,
    yVal: 0,
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
    joystick.thumbx = ox;
    joystick.thumby = oy;
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
    joystick.xVal = 0;
    joystick.yVal = 0;
}

function initCanvas() {
    canvas.width = w;
    canvas.height = h;
    canvas.style.top = window.innerHeight / 2 - h / 2 + "px";
    canvas.style.left = window.innerWidth / 2 - w / 2 + "px";
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

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
    
    // joystick
    if (pointer.isDown) {
        let dx = pointer.x - pointer.sx;
        let dy = pointer.y - pointer.sy;
        let dist = Math.sqrt(dx ** 2 + dy ** 2);
        pointer.vx = dx / dist;
        pointer.vy = dy / dist;
        if (dist !== 0) {
            joystick.mult = dist > joystick.outerRadius ? 1 : dist / joystick.outerRadius;
            joystick.xVal = dx / dist * joystick.mult;
            joystick.yVal = dy / dist * joystick.mult;
            joystick.thumbx = pointer.sx + pointer.vx * joystick.outerRadius * joystick.mult;
            joystick.thumby = pointer.sy + pointer.vy * joystick.outerRadius * joystick.mult;
            
            player.dx = joystick.xVal * player.maxSpeed;
            player.dy = joystick.yVal * player.maxSpeed;
        }
    } else {
        player.dx /= player.friction;
        player.dy /= player.friction;
    }
    
    // boundaries
    if (player.x - 1 > w) player.x = -player.size;
    if (player.x + player.size + 1 < 0) player.x = w;
    if (player.y - 1 > h) player.y = -player.size;
    if (player.y + player.size + 1 < 0) player.y = h;
    
    // apply
    player.x += player.dx;
    player.y += player.dy;
}

function render() {
    update();

    // background
    ctx.fillStyle = "#25313a";
    ctx.fillRect(0, 0, w, h);
    
    // player
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.fillRect(player.x, player.y, player.size, player.size);
    
    // joystick
    if (pointer.isDown) {
        ctx.fillStyle = "#ffffff0f";
        ctx.strokeStyle = "#ffffff6f";
        // outer circle
        ctx.beginPath();
        ctx.arc(pointer.sx, pointer.sy, joystick.outerRadius, 0, 2 * tau);
        ctx.fill();
        ctx.stroke();

        // thumb circle
        ctx.fillStyle = "#fff8";
        ctx.beginPath();
        ctx.moveTo(pointer.sx, pointer.sy);
        ctx.lineTo(joystick.thumbx, joystick.thumby);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(joystick.thumbx, joystick.thumby, joystick.thumbRadius, 0, tau);
        ctx.fill();
    }
    
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Joystick values:", 10, h - 42);
    ctx.fillText(`x: ${joystick.xVal.toFixed(3)}`, 10, h - 26);
    ctx.fillText(`y: ${joystick.yVal.toFixed(3)}`, 10, h - 10);
    requestAnimationFrame(render);
}

function main() {
    initCanvas();
    requestAnimationFrame(render);
}

main();
