"use strict";

import {categories} from "./categories.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let cw, ch, margin, marginTop, marginSide, gw, gh, csize, gsize;
let fontscale = 1;
let darkmode = false;

let menuOpen = true;

let grid = [];
let gridSizeSet = false;
let selectStart = null;
let selectEnd = null;

let charLimit;
let gridFill = 0.6;
let backwardsChance = 0.3;
let category = "fruit";
let wordData = {};
let foundAll = false;

let lastTs, timer;
let timerStarted = false;

let highlights = [];
let highlightStyle = "bubbleFilled";
let highlightHue = 205;

const drawGridLines = false;
const debugShowWords = false;
const logging = false;

const tau = Math.PI * 2;
const tau8 = Math.PI / 4;


////// Helper Functions

const log = str => { if (logging) console.log(str) };
const keys = o => Object.keys(o);
const min = (a, b) => a > b ? b : a;
const max = (a, b) => a > b ? a : b;
const rndInd = arr => (Math.random() * arr.length) | 0;
const choice = arr => arr[rndInd(arr)];
const titleCase = str => str.split(" ").map(a => a[0].toUpperCase() + a.slice(1)).join(" ");

function shuffle(arr, n) {
    for (let i = 0; i < n; i++) {
        arr.push(arr.splice(rndInd(arr), 1)[0]);
    }
}


/////////////////////// MENU ///////////////////////

let animating = false;

const menu = document.querySelector("#menu");
const newGameMenu = document.querySelector("#newGameMenu");
const newGameBtn = document.querySelector("#newGameBtn");
const categorySelect = document.querySelector("#categories");
const gridFillSlider = document.querySelector("#gridFill");
const gridFillVal = document.querySelector("#gridFillVal");
const bwChanceSlider = document.querySelector("#bwChance");
const bwChanceVal = document.querySelector("#bwChanceVal");
const startBtn = document.querySelector("#startBtn");

const menuBtn = document.querySelector("#menuBtn");
const backdrop = document.querySelector("#backdrop");
const settings = document.querySelector("#settings");
const settingsBtn = document.querySelector("#settingsBtn");
const fontSelect = document.querySelector("#fontselect");
const highlightSelect = document.querySelector("#highlightStyle");
const hueSlider = document.querySelector("#highlightHue");
const hueVal = document.querySelector("#hueVal");
const darkBtn = document.querySelector("#darkBtn");


////// Init

let font = "Lexend";
const fonts = ["Lexend", "Gabarito", "Figtree", "Huninn", "SNPro"]
categorySelect.value = "none";

for (let f of fonts) {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    fontSelect.appendChild(opt);
    const file = new FontFace(f, `url(./fonts/${f}.ttf`);
    file.load().then(() => document.fonts.add(file));
}

for (let c in categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = titleCase(c);
    categorySelect.appendChild(opt);
}

function showMenu() {
    menuOpen = true;
    animating = true;
    timerStarted = false;
    menu.classList.remove("hidden");
    categorySelect.value = "none";
}

function hideMenu() {
    menuOpen = false;
    animating = true;
    if (timer > 0 && !foundAll) timerStarted = true;
    menu.classList.add("hidden");
    backdrop.classList.add("hidden");
}


////// Events

newGameBtn.addEventListener("click", () => {
    menuBtn.style.zIndex = 0;
    newGameBtn.style.display = "none";
    newGameMenu.style.display = "grid";
    backdrop.style.transform = "";
    backdrop.classList.remove("hidden");
    startBtn.disabled = true;
    gridSizeSet = false;
});

categorySelect.addEventListener("change", () => {
    category = categorySelect.value;
    startBtn.disabled = categorySelect.value === "none";
});

gridFillSlider.addEventListener("input", () => {
    gridFill = gridFillSlider.value;
    gridFillVal.textContent = `${(gridFill * 100) | 0}%`;
});

bwChanceSlider.addEventListener("input", () => {
    backwardsChance = bwChanceSlider.value;
    bwChanceVal.textContent = `${(backwardsChance * 100) | 0}%`;
});

startBtn.addEventListener("click", initGame);

menuBtn.addEventListener("click", () => {
    if (menuOpen) hideMenu();
    else showMenu();
});

backdrop.addEventListener("transitionend", () => {
    animating = false;
    if (!menuOpen) {
        backdrop.style.transform = "translateY(100%)";
        menuBtn.style.zIndex = 10;
        newGameMenu.style.display = "none";
        newGameBtn.style.display = "block";
        if (!timerStarted) timerStarted = true;
    }
});

settingsBtn.addEventListener("click", () => {
    settings.classList.toggle("hidden");
});

fontSelect.addEventListener("change", () => font = fontSelect.value);

highlightSelect.addEventListener("change", () => highlightStyle = highlightSelect.value);

hueSlider.addEventListener("input", () => {
    document.body.style.setProperty("--bg-hue", hueSlider.value);
    highlightHue = hueSlider.value;
});

darkBtn.addEventListener("click", () => {
    if (darkmode) {
        darkmode = false;
        darkBtn.textContent = "Off";
    } else {
        darkmode = true;
        darkBtn.textContent = "On";
    }
    menu.classList.toggle("dark");
    backdrop.classList.toggle("dark");
    settings.classList.toggle("dark");
});


////////////////// GRID GENERATION /////////////////

function createGrid() {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    for (let i = 0; i < gsize * gsize; i++) {
        grid[i] = {
            word: false,
            letter: choice(letters)
        };
    }
    
    // create word list from category
    const chosenWords = [];
    const copy = JSON.parse(JSON.stringify(categories[category]));
    while (copy.length) {
        const word = copy.splice(rndInd(copy), 1)[0];
        if (word.length > gsize) continue;
        chosenWords.push(word);
    }
    charLimit = gridFill * gsize * gsize;
    shuffle(chosenWords, 1000);
    placeWords(chosenWords);
}

function placeWords(wordsArr) {
    /******
    
    1. Randomly select direction
    2. Get potential starting coords
    3. Randomly select start coord
    4. Follow direction to check for overlaps with other words
    5. Place word if no overlap or overlap uses same letter
        - Else goto step 3
    6. If cannot place word: try another direction, goto step 2
    
    ******/
    
    const dirs = ["—", "|", "\\", "/"]; // for logging
    const axes = [0, 1];
    const diag = [2, 3];
    
    const next = (dir, backwards, x, y) => {
        let nx = x, ny = y;
        if (dir !== 1) nx += backwards ? -1 : 1;
        if (dir > 0) {
            if (dir === 3) ny += backwards ? 1 : -1;
            else ny += backwards ? -1 : 1;
        }
        return [nx, ny];
    }
    
    let charCount = 0;
    while (wordsArr.length) {
        const initWord = wordsArr.pop();
        const word = initWord.toUpperCase().split(" ").join("");
        if (charCount + word.length > charLimit) continue;
        
        const firstDir = Math.random() < 0.3 ? choice(axes) : choice(diag);
        const len = word.length;
        const backwards = Math.random() <= backwardsChance;
        let dir = null;
        log(`${word} (${len}) ${backwards?"*backwards*":""}\n`);
        
        let placed = false;
        const end = gsize - len + 1;
        const len1 = len - 1;
        const regions = [
            // coords for potential start points
            // dir = 0 (—)
            {x: [0, end],      y: [0, gsize],
            xb: [len1, gsize], yb: [0, gsize]},
            // dir = 1 (|)
            {x: [0, gsize],    y: [0, end],
            xb: [0, gsize],    yb: [len1, gsize]},
            // dir = 2 (\)
            {x: [0, end],      y: [0, end],
            xb: [len1, gsize], yb: [len1, gsize]},
            // dir = 3 (/)
            {x: [0, end],      y: [len1, gsize],
            xb: [len1, gsize], yb: [0, end]},
        ];
        while (dir !== firstDir) {
            if (dir === null) dir = firstDir;
            log(`Dir: ${dirs[dir]}`);
            
            // get possible start coords
            let startCoords = [];
            for (let x = regions[dir][backwards ? "xb" : "x"][0];
                x < regions[dir][backwards ? "xb" : "x"][1];
                x++)
            {
                for (let y = regions[dir][backwards ? "yb" : "y"][0];
                    y < regions[dir][backwards ? "yb" : "y"][1];
                    y++)
                {
                    startCoords.push([x, y]);
                }
            }
            
            // check for overlapping words
            let start = null;
            while (startCoords.length) {
                let badOverlap = false;
                
                const i = rndInd(startCoords);
                const [sx, sy] = startCoords.splice(i, 1)[0];
                let nx = sx, ny = sy;
                for (let char of word) {
                    const cell = grid[ny * gsize + nx];
                    if (cell.word && cell.letter !== char) {
                        // non-matching overlap
                        //log("found bad overlap, trying another start point");
                        badOverlap = true;
                        break;
                    }
                    [nx, ny] = next(dir, backwards, nx, ny);
                }
                if (!badOverlap) {
                    start = [sx, sy];
                    break;
                }
            }
            
            if (start) {
                // place letters
                log(`Chose start: (${start})`);
                let [x, y] = start;
                const listStr = titleCase(initWord);
                wordData[word] = {str: listStr, start: start, found: false};
                for (let c = 0; c < word.length; c++) {
                    const char = word[c];
                    const i = gsize * y + x;
                    grid[i].word = true;
                    grid[i].letter = char;
                    if (c === word.length - 1) {
                        wordData[word].end = [x, y];
                        break;
                    }
                    [x, y] = next(dir, backwards, x, y);
                }
                placed = true;
                charCount += word.length;
                break;
            } else {
                // try next direction
                dir = (dir + 1) % 4;
            }
        }
        if (!placed) console.warn(`${word} could not be placed`);
    }
    
    // log num chars used
    let c = 0;
    for (let cell of grid) {
        if (cell.word) c++
    }
    log(`Char count: ${c}/${grid.length}`);
}


/////////////////// GAME FUNCTIONS //////////////////

function getLongestWordLen() {
    if (!category) {
        console.error("no category selected");
        return;
    }
    let max = 0;
    for (let word of categories[category]) {
        if (word.length > max) max = word.length;
    }
    return max;
}

function isWordSelected() {
    if (selectStart && selectEnd) {
        const [sx, sy, ex, ey] = [...selectStart, ...selectEnd];
        for (let w in wordData) {
            const word = wordData[w];
            if (
                (word.start[0] === sx &&
                word.start[1] === sy &&
                word.end[0] === ex &&
                word.end[1] === ey)
                ||
                (word.start[0] === ex &&
                word.start[1] === ey &&
                word.end[0] === sx &&
                word.end[1] === sy)
            ) {
                return w;
            }
        }
    }
    return false;
}

function checkFoundAll() {
    for (let w in wordData) {
        if (!wordData[w].found) return;
    }
    foundAll = true;
    timerStarted = false;
}


////////////////// POINTER HANDLING ////////////////

const ptr = {
    down: false,
    x: null, y: null,  // current pos
    sx: null, sy: null // start pos
}

function onDown(e) {
    if ("touches" in e) {
        ptr.x = e.touches[0].clientX;
        ptr.y = e.touches[0].clientY;
    } else {
        ptr.x = e.offsetX;
        ptr.y = e.offsetY;
    }
    snapToCell();
    ptr.down = true;
    if (!menuOpen) selectStart = selectCell();
}

function onMove(e) {
    if ("touches" in e) {
        ptr.x = e.touches[0].clientX;
        ptr.y = e.touches[0].clientY;
    } else if (ptr.down) {
        ptr.x = e.offsetX;
        ptr.y = e.offsetY;
    }
    snapAngle();
    if (!menuOpen) selectEnd = selectCell();
}

function onUp(e) {
    ptr.down = false;
    
    const selectedWord = isWordSelected();
    if (selectedWord) {
        wordData[selectedWord].found = true;
        highlights.push([...selectStart, ...selectEnd]);
        checkFoundAll();
    }
    selectStart = null;
    selectEnd = null;
}

function selectCell() {
    const cx = Math.floor((ptr.x - marginSide) / csize);
    const cy = Math.floor((ptr.y - marginTop) / csize);
    if (cx > -1 && cx < gsize &&
        cy > -1 && cy < gsize) {
            return [cx, cy];
        }
    return null;
}

function snapToCell() {
    const cx = Math.floor((ptr.x - marginSide) / csize);
    const cy = Math.floor((ptr.y - marginTop) / csize);
    const offsetX = marginSide + csize / 2;
    const offsetY = marginTop + csize / 2;
    ptr.sx = cx * csize + offsetX;
    ptr.sy = cy * csize + offsetY;
}

function snapAngle() {
    const dx = ptr.x - ptr.sx;
    const dy = ptr.y - ptr.sy;
    const step = Math.PI / 4;
    const angle = Math.atan2(dy, dx);
    const snap = Math.round(angle / step) * step;
    
    const d = Math.sqrt(dx * dx + dy * dy);
    ptr.x = ptr.sx + Math.cos(snap) * d;
    ptr.y = ptr.sy + Math.sin(snap) * d;
}

canvas.addEventListener("pointerdown", onDown);
canvas.addEventListener("pointermove", onMove);
canvas.addEventListener("pointerup", onUp);
canvas.addEventListener("touchstart", onDown);
canvas.addEventListener("touchmove", onMove);
canvas.addEventListener("touchend", onUp);


///////////////////// DRAWING ////////////////////

function drawGrid() {
    ctx.font = `${0.6 * csize}px ${font}`;
    ctx.textAlign = "center";
    const offsetX = marginSide + csize / 2;
    const offsetY = marginTop + csize / 2 + 6;
    for (let i = 0; i < grid.length; i++) {
        const gy = (i / gsize) | 0;
        const gx = i % gsize;
        const x = gx * csize + offsetX;
        const y = gy * csize + offsetY;
        if (debugShowWords) {
            ctx.fillStyle = grid[i].word ? "#f00" : "#ccc";
            ctx.strokeStyle = ctx.fillStyle;//
        } else {
            ctx.fillStyle = darkmode ? "#ffffff" : "#000000";
        }
        if (grid[i].word && debugShowWords) {
            ctx.strokeText(grid[i].letter, x, y);
        }
        ctx.fillText(grid[i].letter, x, y);
    }
    if (drawGridLines) {
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 1;
        for (let x = 0; x <= gw; x += csize) {
            const linex = x + marginSide;
            ctx.beginPath();
            ctx.moveTo(linex, marginTop);
            ctx.lineTo(linex, marginTop + gh);
            ctx.stroke();
        }
        for (let y = 0; y <= gh; y += csize) {
            const liney = y + marginTop;
            ctx.beginPath();
            ctx.moveTo(marginSide, liney);
            ctx.lineTo(marginSide + gw, liney);
            ctx.stroke();
        }
    }
}

function drawWordList() {
    // header + underline
    const headerY = marginTop * 4 + gh;
    ctx.font = `24px ${font}`;
    ctx.textAlign = "left";
    ctx.strokeStyle = darkmode ? "#ffffff" : "#000000";
    ctx.fillStyle = darkmode ? "#ffffff" : "#000000";
    ctx.lineWidth = 2;
    ctx.fillText(titleCase(category), marginSide, headerY);
    const ulY = headerY + 6;
    ctx.beginPath();
    ctx.moveTo(marginSide, ulY);
    ctx.lineTo(marginSide + gw, ulY);
    ctx.stroke();
    
    // list
    const startx = marginSide;
    const starty = headerY + 32;
    const fontsize = 16;
    ctx.font = `${fontsize}px ${font}`;
    const k = keys(wordData);
    for (let i = 0; i < k.length; i++) {
        const word = wordData[k[i]];
        const x = i % 2 === 0 ? startx : startx + gw / 2;
        const y = ((i / 2) | 0) * fontsize * 1.2 + starty;
        ctx.fillStyle = word.found ? (darkmode ? "#444" : "#bbb") : (darkmode ? "#fff" : "#000");
        ctx.fillText(word.str, x, y);
        // strikethrough
        if (word.found) {
            const width = ctx.measureText(word.str).width;
            const lineY = y - fontsize * 0.3;
            ctx.strokeStyle = darkmode ? "#444" : "#ccc";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, lineY);
            ctx.lineTo(x + width, lineY);
            ctx.stroke();
        }
    }
}

function drawHighlights() {
    let allHighlights = highlights;
    if (selectStart !== null && selectEnd !== null) {
        allHighlights = [...allHighlights, [...selectStart, ...selectEnd]];
    }
    
    const offsetX = marginSide + csize / 2;
    const offsetY = marginTop + csize / 2;
    const hlw = csize * 0.67;
    const hlw2 = hlw / 2;
    ctx.lineCap = "round";
    if (highlightStyle === "bubble") {
        ctx.lineWidth = csize * 0.08;
        ctx.strokeStyle = darkmode ?
            `hsl(${highlightHue},86%,29%)` :
            `hsl(${highlightHue},100%,75%)`;
    } else if (highlightStyle === "bubbleFilled") {
        ctx.lineWidth = hlw;
        ctx.strokeStyle = `hsla(${highlightHue},100%,50%,0.5)`;
    } else if (highlightStyle === "line") {
        ctx.lineWidth = csize * 0.13;
        ctx.strokeStyle = `hsla(${highlightHue},100%,50%,0.5)`;
    }
    
    for (let h of allHighlights) {
        const [sx, sy, ex, ey] = h;
        const startx = sx * csize + offsetX;
        const starty = sy * csize + offsetY;
        const endx = ex * csize + offsetX;
        const endy = ey * csize + offsetY;
        
        if (highlightStyle !== "bubble") {
            ctx.beginPath();
            ctx.moveTo(startx, starty);
            ctx.lineTo(endx, endy);
            ctx.stroke();
        } else {
            if (sx === ex && sy === ey) {
                ctx.beginPath();
                ctx.arc(startx, starty, hlw2, 0, tau);
                ctx.stroke();
                continue;
            }
            const dx = endx - startx;
            const dy = endy - starty;
            const d = Math.sqrt(dx * dx + dy * dy);
            const tx = (dy / d) * hlw2;
            const ty = (-dx / d) * hlw2;
            
            // verts
            const s1x = startx + tx;
            const s1y = starty + ty;
            const s2x = startx - tx;
            const s2y = starty - ty;
            const e1x = endx + tx;
            const e1y = endy + ty;
            const e2x = endx - tx;
            const e2y = endy - ty;
            
            // arcs
            const angle = Math.atan2(ty, tx);
            ctx.beginPath();
            ctx.arc(startx, starty, hlw2, angle + Math.PI, angle);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(endx, endy, hlw2, angle, angle + Math.PI);
            ctx.stroke();
            
            // straights
            ctx.beginPath();
            ctx.moveTo(s1x, s1y);
            ctx.lineTo(e1x, e1y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(s2x, s2y);
            ctx.lineTo(e2x, e2y);
            ctx.stroke();
        }
    }
}

function drawTimer() {
    if (timer > 0) {
        let s = Math.floor(timer / 1000);
        const min = Math.floor(s / 60);
        s %= 60;
        const sec = s < 10 ? `0${s}` : String(s);
        ctx.fillStyle = foundAll ? "#00ff00" : darkmode ? "#ffffff" : "#000000";
        ctx.textAlign = "center";
        ctx.fillText(`${min}:${sec}`, cw / 2, ch - 20);
    }
}


//////////////////// MAIN LOOP ////////////////////

function run(ts) {
    ctx.fillStyle = darkmode ? "#151515" : "#ffffff";
    ctx.fillRect(0, 0, cw, ch);
    drawHighlights();
    drawGrid();
    drawWordList();
    drawTimer();
    
    if (timerStarted) {
        timer += ts - lastTs;
    }
    lastTs = ts;
    requestAnimationFrame(run);
}


//////////////////////// INIT ////////////////////////

function resize() {
    const dpr = window.devicePixelRatio;
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = cw + "px";
    canvas.style.height = ch + "px";
    log(`Canvas w/h: ${cw}px / ${ch}px`);
    
    if (gridSizeSet) {
        csize = gw / gsize;
        setDimensions();
    }
}

function setGridSize() {
    // set num cells for grid width/height
    const minCSize = 30;
    const maxCSize = 40;
    
    for (let c = getLongestWordLen() + 2; c > 0; c--) {
        csize = gw / c;
        if (csize >= minCSize) {
            gsize = c;
            gridSizeSet = true;
            break;
        }
    }
    if (!gridSizeSet) {
        console.error("could not set grid/cell size");
    }
    
    log(`Grid size: ${gsize}\nCell size: ${csize}px`);
}

function setDimensions() {
    // set grid width/height/margins in px
    const minMargin = window.innerHeight * 0.03;
    const minWH = cw - minMargin * 2;
    
    marginTop = minMargin;
    gh = ch / 2 - marginTop;
    if (gh > cw - minMargin * 2) gh = minWH;
    gw = gh;
    
    if (!gridSizeSet) setGridSize();
    marginSide = (cw - csize * gsize) / 2;
    
    log(`Grid w/h: ${gw}px / ${gh}px`);
    log(`Top margin: ${marginTop}px\nSide Margin: ${marginSide}px`);
}

function initGame() {
    foundAll = false;
    timer = 0;
    grid = [];
    wordData = [];
    highlights = [];
    
    setDimensions();
    createGrid();
    hideMenu();
    requestAnimationFrame(ts => lastTs = ts);
    run();
}

window.onload = resize;
window.onresize = resize;
