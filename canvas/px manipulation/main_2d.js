const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
let w = 300;
let h = 300;
const imageData = ctx.createImageData(w, h);
const data = imageData.data;

function color(r, g, b, a) {
    return {r: r, g: g, b: b, a: a ? a : 255};
}

const skyblue = color(127, 200, 255);
const orange = color(255, 120, 10);
const purple = color(148, 55, 239);
const green = color(36, 181, 4);
const CANVAS_BG = skyblue;

const squares = [];

function square(size, color) {
    const s = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        size: size,
        color: color
    };
    s.draw = () => {
        for (let y = 0; y < s.size; y++)
            for (let x = 0; x < s.size; x++) setPixel((s.x + x) | 0, (s.y + y) | 0, s.color);
    };
    return s;
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
    canvas.style.top = window.innerHeight / 2 - h / 2 - 2 + "px";
    canvas.style.left = window.innerWidth / 2 - w / 2 - 2 + "px";
    squares.length = 0;

    //// TESTING
    squares.push(square(24, purple));
    squares.push(square(24, orange));
    squares.push(square(24, green));
    for (let i = 0; i < squares.length; i++) {
        squares[i].dx = i * Math.random() + (1 - Math.random() * i);
        squares[i].dy = i + Math.random() + (1 - Math.random() * i);
        squares[i].y = i * 20;
        squares[i].x = i * 40;
    }
}

function update() {
    for (let s of squares) {
        if (s.dx > 0 && s.x + s.size > w) s.dx = -s.dx;
        if (s.dx < 0 && s.x < 0) s.dx = -s.dx;
        if (s.dy > 0 && s.y + s.size > h) s.dy = -s.dy;
        if (s.dy < 0 && s.y < 0) s.dy = -s.dy;
        s.x += s.dx;
        s.y += s.dy;
    }
}

function render() {
    update();
    
    // background
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) setPixel(x, y, CANVAS_BG);
    
    // squares
    for (let s of squares) s.draw();

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(render);
}

function main() {
    initCanvas();
    requestAnimationFrame(render);
}

main();
