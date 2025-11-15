const sim = document.querySelector("#sim");
const simRect = sim.getBoundingClientRect();
const slider = document.querySelector("#numPlayers");
const sliderLabel = document.querySelector(".range > label");
const speedSelectors = document.querySelectorAll("input[type='radio']");
const targetingCheckbox = document.querySelector("#targeting");
const bounceCheckbox = document.querySelector("#bounce");

let debug = 0;
let step = 1;

let playerList = [];
let playersPerTeam = 2;
let targetEnabled = 1;
let bounceEnabled = 1;
const initSpeed = 1;
let gameSpeed = 1;
let gameover = 0;


// TO DO:
// fix targeting
////  work on different movement-modes:
// using "chase-nearest" right now
//     -adjust speed the closer it is to target?
// add "icons bounce against each other" mode
// make sure players aren't on top of each other on init

function checkWin() {
    let t = playerList[0].team;
    for (let p = 0; p < playerList.length; p++) {
        if (playerList[p].team !== t) return;
    }
    for (let p of playerList) {
        p.gameOver();
    }
    gameover = 1;
}

function player(id, team) {
    this.id = id;
    this.team;
    this.targetTeam;
    this.target;
    this.speed = gameSpeed;
    this.slow = 0;
    this.x = Math.random() * (simRect.width - 28);
    this.y = Math.random() * (simRect.height - simRect.top) + simRect.top;
    this.baseDx = Math.random() * 2 - 1;
    this.baseDy = (gameSpeed - Math.abs(this.baseDx)) * (Math.round(Math.random()) ? 1 : -1);
    this.dx = this.baseDx;
    this.dy = this.baseDy;
    this.bx = 0;
    this.by = 0;

    let gridPos = [],
        bounced = 0;

    this.icon = new Image();
    this.icon.id = "id" + id;
    this.icon.style.left = String(this.x) + "px";
    this.icon.style.top = String(this.y) + "px";
    sim.appendChild(this.icon);

    const setTeam = team => {
        this.team = team;
        this.target = null;
        this.targetTeam = team === "rock" ? "scissors" : team === "paper" ? "rock" : "paper";
        this.icon.src = "./icons/" + team + "-128.png";
        this.icon.className = team;
        const iconRect = this.icon.getBoundingClientRect();
        this.width = iconRect.width;
        this.height = iconRect.height;
        //console.log(`${this.id}: setTeam() -> ${this.team}, targeting ${this.targetTeam}`);
    };
    setTeam(team);

    const distanceFrom = target => {
        const xDist = target.x - this.x;
        const yDist = target.y - this.y;
        const D = Math.sqrt(xDist ** 2 + yDist ** 2);
        return [D, xDist, yDist];
    };
    const findTarget = () => {
        const targets = playerList.filter(p => p.team === this.targetTeam);
        if (targets.length === 0) {
            this.target = 0;
            return;
        }
        let min = Infinity;
        for (let target of targets) {
            const thisDist = distanceFrom(target)[0];
            if (thisDist < min) {
                min = thisDist;
                this.target = target;
            }
        }
        //console.log(`${this.id} (${this.team}) chose target ${this.target.id} (${this.target.team})`);
    };
    const chaseTarget = () => {
        if (this.target) {
            const [d, x, y] = distanceFrom(this.target);
            this.dx = x / d;
            this.dy = y / d;
        } else if (!this.slow) {
            // slow down so the game doesn't go on forever lol
            this.dx = this.baseDx * 0.5;
            this.dy = this.baseDy * 0.5;
            this.slow = 1;
            // ?????
        }
    };
    const handleBounce = () => {
        // used when targeting is on
        // temporarily throws players off their path
        if (bounced) {
            if (Math.abs(this.bx) > 0.05) this.bx /= 1.05;
            if (Math.abs(this.by) > 0.05) this.by /= 1.05;
            if (Math.abs(this.bx) <= 0.05 && Math.abs(this.by) <= 0.05) {
                bounced = 0;
                this.bx = 0;
                this.by = 0;
            }
        }
    };
    const move = () => {
        this.x = parseFloat(this.icon.style.left);
        this.y = parseFloat(this.icon.style.top);
        if (this.x < 0 || this.x > simRect.width) this.dx = -this.dx;
        if (this.y < simRect.top || this.y > simRect.bottom) this.dy = -this.dy;
        this.icon.style.left = this.dx * gameSpeed + this.bx + this.x + "px";
        this.icon.style.top = this.dy * gameSpeed + this.by + this.y + "px";
    };

    const setGrid = () => {
        // set collision grid coords
        // 40px width, 48px height per grid cell
        // (approx double the avg icon dimensions)
        // grid cell top-left corner is in:
        const gx = (this.x / 40) | 0;
        const gy = (this.y / 48) | 0;
        const topRight = (((this.x + this.width) / 40) | 0) > gx;
        const btmLeft = (((this.y + this.height) / 48) | 0) > gy;
        const btmRight = topRight && btmLeft;

        const coords = [gx + "/" + gy]; // top left
        if (topRight) coords.push(gx + 1 + "/" + gy);
        if (btmLeft) coords.push(gx + "/" + (gy + 1));
        if (btmRight) coords.push(gx + 1 + "/" + (gy + 1));

        collisions.addPlayer(coords, this.id);
        gridPos = coords;
    };
    this.getHitbox = () => {
        // rock: 20x22
        // paper: 18x24
        // scissors: 17x24
        switch (this.team) {
            case "rock":
                return {left: this.x, right: this.x + 20, top: this.y, bottom: this.y + 22};
            case "paper":
                return {left: this.x, right: this.x + 18, top: this.y, bottom: this.y + 24};
            case "scissors":
                return {left: this.x, right: this.x + 17, top: this.y, bottom: this.y + 24};
        }
    };
    this.checkCollisions = function () {
        // lots of ifs for "efficiency" lol
        for (let coord of gridPos) {
            // skip if only player in grid space
            if (collisions.grid[coord].length > 1) {
                for (const playerId of collisions.grid[coord]) {
                    if (playerId !== this.id) {
                        //console.log(`${this.id} (${this.team}) near\n${playerId} (${playerList[playerId].team})`);
                        const other = playerList[playerId];
                        const pHB = this.getHitbox();
                        const oHB = other.getHitbox();
                        // the actual collision check:
                        if (
                            !(pHB.right < oHB.left || oHB.right < pHB.left) &&
                            !(pHB.bottom < oHB.top || oHB.bottom < pHB.top)
                        ) {
                            // handle collision
                            if (bounceEnabled) {
                                if (targetEnabled) {
                                    // temporary diversion
                                    bounced = 1;
                                    this.bx = other.dx * 3;
                                    this.by = other.dy * 3;
                                } else {
                                    // change direction
                                    if (Math.abs(this.x - other.x) > Math.abs(this.y - other.y)) {
                                        // horizontal collision
                                        this.dx = -this.dx;
                                    } else {
                                        // vertical collision
                                        this.dy = -this.dy;
                                    }
                                }
                            }
                            // set team
                            if (other.targetTeam === this.team) {
                                //console.log(`${playerList[playerId].id}: ${playerList[playerId].team}`);
                                setTeam(other.team);
                            }
                        }
                    }
                }
            }
        }
    };
    this.updatePos = function () {
        if (targetEnabled) {
            findTarget(); // CUT BACK
            chaseTarget();
        }
        move();
        if (bounced) handleBounce();
        setGrid();
    };
    this.gameOver = function () {
        this.icon.classList.add("game-over");
        this.baseDx = 0;
        this.baseDy = 0;
    };
}

const collisions = {
    grid: {},
    addPlayer: function (coordArray, playerId) {
        for (let coord of coordArray) {
            if (!this.grid[coord]) this.grid[coord] = [playerId];
            if (!this.grid[coord].includes(playerId)) this.grid[coord].push(playerId);
        }
    }
};

const readout = document.createElement("div");
document.body.appendChild(readout);
readout.id = "readout";
let p0;
function init() {
    if (debug) {
        gameSpeed = document.querySelector("input[type='radio']:checked").value * 3;
        const btn = document.createElement("button");
        btn.id = "step";
        btn.textContent = "STEP";
        document.body.appendChild(btn);
        btn.addEventListener("click", run);
    }

    let pid = 0;
    playersPerTeam = slider.value;
    const teams = ["rock", "paper", "scissors"];
    if (playerList.length > 0) for (let p of playerList) sim.removeChild(p.icon);
    playerList = [];
    collisions.grid = {};
    gameover = 0;

    for (let i = 0; i < 3; i++) {
        for (let p = 0; p < playersPerTeam; p++) {
            playerList.push(new player(pid, teams[i]));
            pid++;
        }
    }
    p0 = playerList[0];
}

function chgPlayerProp(prop, val) {
    if (playerList.length > 0) for (const p of playerList) p[prop] = val;
}

function update() {
    if (debug) {
        step++;
    }
    collisions.grid = {};
    for (let p of playerList) {
        p.updatePos();
    }
    for (let p of playerList) {
        p.checkCollisions();
    }
    checkWin();
    
    /*
    readout.innerHTML = `id0 (${p0.team}) => ${p0.targetTeam}<br>
x: ${p0.x.toFixed(1)}\ty: ${p0.y.toFixed(1)}<br>
dx: ${p0.dx.toFixed(2)}\tdy: ${p0.dy.toFixed(2)}<br><br>
bounced :${p0.bounced}<br>
bX: ${p0.bx.toFixed(2)}\tbY: ${p0.by.toFixed(2)}`;
*/
}

function run() {
    if (!gameover) {
        update();
        if (!debug) requestAnimationFrame(run);
    }
}

slider.addEventListener("pointermove", () => {
    sliderLabel.textContent = slider.value == 1 ? "1 player/team" : slider.value + " players/team";
});

bounceCheckbox.addEventListener("change", () => {
    bounceEnabled = bounceCheckbox.checked;
});
targetingCheckbox.addEventListener("change", () => {
    targetEnabled = targetingCheckbox.checked;
    chgPlayerProp("slow", 0);
});

for (const s of speedSelectors) {
    s.addEventListener("change", () => {
        gameSpeed = s.value;
        //chgPlayerProp("speed", gameSpeed);
    });
}

document.querySelector("#startBtn").addEventListener("click", () => {
    init();
    run();
});

const debugBtn = document.querySelector("#debugBtn");
debugBtn.addEventListener("click", () => {
    if (debug) {
        debug = 0;
        debugBtn.textContent = "Debug OFF";
    } else {
        debug = 1;
        debugBtn.textContent = "Debug ON";
    }
    gameover = 1;
    init();
    run();
});
