"use strict";

import {CanvasSetup} from "./CanvasSetup.js";

const c = document.querySelector("canvas");
const canvas = new CanvasSetup(c);
const ctx = canvas.get2D();

const cx = canvas.centerX;
const cy = canvas.centerY;
const tau = Math.PI * 2;
const tau4 = tau / 4;
const tau12 = tau / 12;
const tau60 = tau / 60;

// clock hands
const hands = [
    // [length, color, position key]
    // is also drawing order
    [50, "#091728", "hPos"], // hour
    [90, "#091728", "mPos"], // min
    [70, "#ff0000", "sPos"], // sec
];

let clockFace = null;

const clock = {
    mode: 0, // 0 = one update/sec; 1 = continuous
    started: false,
    holdTs: 0,
    radius: 150,
    h: 0,
    m: 0,
    s: 0,
    ms: 0,
    get hPos() {
        return ((this.h > 12 ? this.h - 12 : this.h) * 60 + this.m) / 720;
    },
    get mPos() {
        return (this.m * 60 + this.s) / 3600;
    },
    get sPos() {
        if (this.mode === 0) return this.s / 60;
        else return (this.s * 1000 + this.ms) / 60000;
    }
};

function syncTime(restart = true) {
    const now = new Date(Date.now());
    if (restart) clock.started = false;
    clock.h = now.getHours();
    clock.m = now.getMinutes();
    clock.s = now.getSeconds();
    clock.ms = now.getMilliseconds();
}

function incrementClock1Sec() {
    if (clock.s === 59) {
        clock.s = 0;
        if (clock.m === 59) {
            clock.m = 0;
            if (clock.h === 23) clock.h = 0;
            else clock.h++;
        } else clock.m++;
    } else clock.s++;
}

function update(ts) {
    if (!clock.started) {
        clock.holdTs = ts;
        clock.started = true;
        return;
    }

    if (clock.mode === 0 && ts >= clock.holdTs + 1000) {
        clock.holdTs += 1000;
        incrementClock1Sec();
    } else if (clock.mode === 1) {
        syncTime(false);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!clockFace) {
        
        // outer edge
        const inner = clock.radius - 18;
        ctx.fillStyle = "#1f416b";
        ctx.strokeStyle = "#091728";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, clock.radius, 0, tau);
        ctx.fill();
        ctx.stroke();
        
        // inner edge + face
        ctx.lineWidth = 4;
        ctx.fillStyle = "#f5f5f5";
        ctx.strokeStyle = "#09213c";
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, tau);
        ctx.fill();
        ctx.stroke();

        // face numbers
        ctx.fillStyle = "#091728";
        for (let i = 1; i < 13; i++) {
            const a = tau12 * i - tau4;
            const x = Math.cos(a) * (inner - 30) + cx;
            const y = Math.sin(a) * (inner - 30) + cy + 9;
            ctx.fillText(String(i), x, y);
        }

        // minute marks
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#13253a";
        for (let i = 0; i < 60; i++) {
            const len = i % 5 === 0 ? 12 : 6;
            const a = tau60 * i - tau4;
            const ax = Math.cos(a);
            const ay = Math.sin(a);
            const sx = inner * ax + cx;
            const sy = inner * ay + cy;
            const ex = (inner - len) * ax + cx;
            const ey = (inner - len) * ay + cy;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
        }
        ctx.lineCap = "square";

        // cache
        clockFace = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
        ctx.putImageData(clockFace, 0, 0);
    }

    // hands
    ctx.lineWidth = 1.5;
    const baseWidth = 4;
    //// angle
    let a, ac, as;
    //// vertices
    let v1x, v1y, v2x, v2y, v3x, v3y;
    ctx.strokeStyle = "#09172899";
    for (let hand of hands) {
        const [length, color, pos] = hand;
        ctx.fillStyle = color;
        //ctx.strokeStyle = color;
        
        a = clock[pos] * tau - tau4;
        ac = Math.cos(a);
        as = Math.sin(a);
        v1x = cx + as * baseWidth;
        v1y = cy - ac * baseWidth;
        v2x = cx + ac * length;
        v2y = cy + as * length;
        v3x = cx - as * baseWidth;
        v3y = cy + ac * baseWidth;
        
        ctx.beginPath();
        ctx.moveTo(v1x, v1y);
        ctx.lineTo(v2x, v2y);
        ctx.lineTo(v3x, v3y);
        ctx.stroke();
        ctx.fill();
    }

    // center dot
    ctx.fillStyle = "#e9ecf0";
    ctx.strokeStyle = "#09213c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, tau);
    ctx.fill();
    ctx.stroke();
}

////////// INIT //////////

syncTime();
canvas.onUpdate = update;
canvas.onDraw = draw;
ctx.font = "bold 24px sans-serif";
ctx.textAlign = "center";
