"use strict";

import {Config, Menu, ColorSchemes} from "./config.js";

const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const canvas = document.querySelector("canvas");
const menuBtn = document.querySelector("#menuBtn");
const menuEl = document.querySelector("#menu");

const ctx = canvas.getContext("2d");
const dpr = window.devicePixelRatio;
const quality = "native"; // default, native, oversample
let oversampleMult = 1.5; // this doesn't work lol
let h, w;
const bgcolor = "rgba(0,0,0,";

let targetFPS = 60;
let targetFT = 1000 / targetFPS;
let lastTs;
let acc = 0;

const tau = Math.PI * 2;

let particles = [];
let menuOpen = false;
let usingPreset = true;
let selectedPreset = "default";


function toggleMenu() {
    if (menuOpen) {
        menuOpen = false;
        menuEl.style.transform = "translateX(100%)";
    } else {
        menuOpen = true;
        menuEl.style.transform = "translateX(0)";
    }
}

function genColor(color) {
    if (color !== "random") return choice(ColorSchemes[color]);
    return rndHexColor();
}


////// PARTICLE CLASS //////

class Particle {
    constructor(clock) {
        this.x = pointer.x;
        this.y = pointer.y;
        
        const speed = Math.random() * (Config.maxSpeed - Config.minSpeed) + Config.minSpeed;
        const ux = Math.random();
        const uy = Math.sqrt(1 - ux * ux);
        this.dx = ux * speed * (coinToss() ? 1 : -1);
        this.dy = uy * speed * (coinToss() ? 1 : -1);
        if (Config.pushEnabled) {
            this.dx += pointer.dx * Config.pushForce;
            this.dy += pointer.dy * Config.pushForce;
        }
        
        this.radius = Config.particleSize;
        this.color = genColor(Config.selectedColors);
        this.lifespan = Math.random() * (Config.maxLife - Config.minLife) + Config.minLife;
        this.birthday = clock;
        this.elapsed = 0;
        this.inside = true;
    }
    update(clock) {
        this.elapsed = clock - this.birthday;
        if (this.x - this.radius < 0) {
            if (!Config.wallsEnabled) this.inside = false;
            else {
                this.x = this.radius;
                this.dx = -this.dx;
            }
        }
        if (this.x + this.radius > w) {
            if (!Config.wallsEnabled) this.inside = false;
            else {
                this.x = w - this.radius;
                this.dx = -this.dx;
            }
        }
        if (Config.wallsEnabled) {
        // (allow gravity to bring particles back onscreen)
            if (this.y - this.radius < 0) {
                this.y = this.radius;
                this.dy = -this.dy;
            }
            if (this.y + this.radius > h) {
                this.y = h - this.radius;
                this.dy = -this.dy;
            }
        }
        
        if (Config.frictionEnabled) this.dx /= Config.friction;
        if (Config.gravity !== 0 && Config.gravityEnabled) this.dy += Config.gravity;
        else if (Config.frictionEnabled) this.dy /= Config.friction;
        
        if (pointer.isDown && Config.magnetEnabled && Config.magnet > 0) {
            if (this.x < pointer.x) this.dx += Config.magnet;
            if (this.x > pointer.x) this.dx -= Config.magnet;
            if (this.y < pointer.y) this.dy += Config.magnet;
            if (this.y > pointer.y) this.dy -= Config.magnet;
        }
        
        this.x += this.dx;
        this.y += this.dy;
    }
    draw() {
        const lifetime = (this.lifespan - this.elapsed) / this.lifespan;
        const alpha = decToHex255(Math.floor(lifetime * 255));
        ctx.fillStyle = this.color + alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, tau);
        ctx.fill();
    }
}


////// POINTER //////

const pointer = {
    isDown: false,
    downAt: 0,
    lastTs: 0,
    acc: 0,
    x: null,
    y: null,
    px: null, // previous
    py: null,
    dx: 0, // delta
    dy: 0
};

function handleDown(e) {
    pointer.isDown = true;
    pointer.downAt = performance.now();
    pointer.lastTs = pointer.downAt;
    pointer.acc = 0;
    const p = isMobile ? e.touches[0] : e;
    pointer.x = p.clientX;
    pointer.y = p.clientY;
    pointer.px = pointer.x;
    pointer.py = pointer.y;
}

function handleMove(e) {
    if (isMobile) {
        pointer.x = e.touches[0].clientX;
        pointer.y = e.touches[0].clientY;
    } else if (pointer.isDown) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
    }
}

function handleUp(e) {
    pointer.dx = 0;
    pointer.dy = 0;
    pointer.isDown = false;
}


////// ENGINE //////

// Utility funcs

function coinToss() {
    return Math.round(Math.random());
}

function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function rndHexColor() {
    const h = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    let st = "#";
    for (let i = 0; i < 6; i++) st += choice(h);
    return st;
}

function clampPointerSpeed(min, max) {
    if (pointer.dx < min) pointer.dx = min;
    if (pointer.dy < min) pointer.dy = min;
    if (pointer.dx > max) pointer.dx = max;
    if (pointer.dy > max) pointer.dy = max;
}

function decToHex255(n) {
    const letters = {
        10: "a",
        11: "b",
        12: "c",
        13: "d",
        14: "e",
        15: "f"
    };
    let st;
    const a = Math.floor(n / 16);
    const b = n % 16;
    st = a < 10 ? String(a) : letters[a];
    st += b < 10 ? String(b) : letters[b];
    return st;
}

// Physics + Rendering

function update() {
    
    const clock = performance.now();
    
    // pointer
    if (pointer.isDown) {
        pointer.dx = pointer.x - pointer.px;
        pointer.dy = pointer.y - pointer.py;
        pointer.px = pointer.x;
        pointer.py = pointer.y;
        clampPointerSpeed(-10, 10);
        
        pointer.acc += clock - pointer.lastTs;
        pointer.lastTs = clock;
        const n = Math.floor(pointer.acc / Config.spawnDelay);
        if (n > 0) {
            pointer.acc -= Config.spawnDelay * n;
            for (let i = 0; i < n; i++) {
                particles.push(new Particle(clock));
            }
        }
    }
    
    particles.forEach(p => { p.update(clock); });
    particles = particles.filter(p => p.elapsed < p.lifespan && p.inside);
    Menu.performance.particleCount.textContent = particles.length;
}

function draw() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = bgcolor + (Config.fadeEffect ? Config.fadeEffectAlpha : "1") + ")";
    ctx.fillRect(0, 0, w, h);
    canvas.style.filter = `blur(${Config.blurEnabled ? Config.blur : 0}px)`;
    
    ctx.globalCompositeOperation = Config.blendMode;
    particles.forEach(p => {
        p.draw();
    });
}

function run(ts) {
    if (!lastTs) lastTs = ts;
    const dTime = ts - lastTs;
    acc += dTime;
    lastTs = ts;

    while (acc >= targetFT) {
        update();
        acc -= targetFT;
    }
    draw();

    requestAnimationFrame(run);
}


////// INIT //////

// canvas
const mult = quality !== "oversample" ? 1 : oversampleMult;
h = window.innerHeight * mult;
w = window.innerWidth * mult;
canvas.height = h;
canvas.width = w;
if (quality !== "default") {
    const mdpr = dpr * mult;
    canvas.height *= mdpr;
    canvas.width *= mdpr;
    ctx.scale(mdpr, mdpr);
    canvas.style.height = window.innerHeight + "px";
    canvas.style.width = window.innerWidth + "px";
}

Config.applyPreset("default");


////// EVENT LISTENERS //////

if (isMobile) {
    canvas.addEventListener("touchstart", handleDown);
    canvas.addEventListener("touchmove", handleMove);
    canvas.addEventListener("touchend", handleUp);
} else {
    canvas.addEventListener("pointerdown", handleDown);
    canvas.addEventListener("pointermove", handleMove);
    canvas.addEventListener("pointerup", handleUp);
}

menuBtn.addEventListener("click", toggleMenu);

Menu.presetInput.addEventListener("change", function() {
    Config.applyPreset(this.value);
});

for (let propName in Menu.inputs) {
    const input = Menu.inputs[propName];
    const eType = input.type === "range" ? "input" : "change";
    input.element.addEventListener(eType, function() {
        Config.setCustom();
        switch (input.type) {
            // thank you closures for making this possible lmao
            
            case "select":
                Config[propName] = this.value;
                break;
                
            case "checkbox":
                if ("setValue" in input) input.setValue(this.checked);
                else Config[propName] = this.checked;
                break;
                
            case "range":
                if ("setValue" in input) input.setValue(parseFloat(this.value));
                else Config[propName] = parseFloat(this.value);
                
                // update displays
                input.display.textContent = this.value;
                if ("unit" in input) input.display.textContent += input.unit;
                if (propName === "spawnDelay" || propName === "maxLife" || propName === "minLife") {
                    let avg;
                    if (Config.minLife > Config.maxLife) avg = Config.minLife;
                    else avg = (Config.maxLife + Config.minLife) / 2;
                    const n = Math.round((avg * 0.001) * (1000 / Config.spawnDelay));
                    Menu.performance.maxParticles.textContent = `${n} (approx.)`;
                }
                break;
        }
    });
}


////// RUN FORREST RUN //////

requestAnimationFrame(run);
