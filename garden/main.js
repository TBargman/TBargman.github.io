/*////////////////////////////// TO-DO /////////////

- Options Menu (separate js?) (what options???)
- Currency + seed store or something
- Reorganize menus as separate objects???
- Organize all element selections as objects???
- Moar plants
- Make it pretty
- Dark mode??? ("nocturnal mode")

//////////////////////////////////////////////////*/


"use strict";
import * as plants from "./plants.js";
import { Menus, topBar } from "./elements.js";
import { marketMainCont } from "./market.js";

export let FPS = 30;
const enableSave = true;
const autosaveInterval = 15;
let autoSave = true;


////////////////////////////////////////////////////
//               ELEMENT SELECTIONS               //
////////////////////////////////////////////////////

const gardenDiv = document.querySelector("#garden");

function getPlotDivs() { return document.querySelectorAll(".plotIcon"); }
function getSeedIconDivs() { return document.querySelectorAll(".seedIcon"); }


////////////////////////////////////////////////////
//              DEFINE GARDEN+LOGIC               //
////////////////////////////////////////////////////

const eventSetMoney = new Event("setMoney");
const eventMarketMode = new Event("marketMode");
export const Money = {
    amt: 500,
    marketMode: "buy",
    set amount(val) {
        this.amt = val;
        window.dispatchEvent(eventSetMoney);
    },
    get amount() {
        return this.amt;
    },
    set mode(val) { // mode only applies to market
        this.marketMode = val;
    },
    get mode() {
        return this.marketMode;
    }
};
window.addEventListener("setMoney", () => {
    topBar.moneyCount.textContent = Money.amount;
});

const Garden = {
    height: 0,
    width: 0,
    grid: undefined,
    timer: 1,
};

export let Inventories = {
    Seeds: {
        Carrot: 3
    },
    Plants: {}
};

function Plot(y, x) {
    this.id = y + "-" + x;
    this.cy = y;
    this.cx = x;
    this.state = 0; // 0: Grass, 1: Soil, 2: Planted
    this.plant = null;

    this.till = function () {
        this.state = 1;
        Garden.grid[this.cy][this.cx].plant = new plants.Plant();
        document.querySelector("#icon_" + this.id).src = "./assets/soil.png";
        toggleMenu("plotMenu");
    };

    this.newPlant = function (plant) {
        this.state = 2;
        Garden.grid[this.cy][this.cx].plant = new plants[plant]();
        Inventories.Seeds[plant]--;

        // update plot icon
        document.querySelector("#icon_" + this.id).src = plants.imgs[plant];
        document.querySelector("#progBar_" + this.id).style.visibility = "visible";
        toggleMenu("plotMenu");
    };

    this.harvest = function () {
        this.state = 1;

        // add to inventories
        const plantName = this.plant.name;
        if (plantName in Inventories.Seeds) {
            Inventories.Seeds[plantName] += this.plant.seedYield;
        } else {
            Inventories.Seeds[plantName] = this.plant.seedYield;
        }
        if (plantName in Inventories.Plants) {
            Inventories.Plants[plantName] += 1;
        } else {
            Inventories.Plants[plantName] = 1;
        }

        // reset plot + plotMenu
        this.plant = new plants.Plant();
        document.querySelector("#icon_" + this.id).src = "./assets/soil.png";
        document.querySelector("#progBar_" + this.id).style.width = 0;
        document.querySelector("#progBar_" + this.id).style.visibility = "hidden";
        updateMenu("plotMenu");
    };
}

function newGame(h, w) {
    Garden.height = h;
    Garden.width = w;
    Garden.grid = [];
    for (let y = 0; y < h; y++) {
        Garden.grid.push([]);
    }
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            Garden.grid[y][x] = new Plot(y, x);
        }
    }
    Inventories.Seeds = {
        Carrot: 3,
        Potato: 3,
        Tomato: 3
    };
    Inventories.Plants = {};
    Money.amount = 50;

    // initialize storage
    localStorage.clear();
    save();
}

export function expandGarden() {
    for (let y = 0; y < Garden.height; y++) {
        Garden.grid[y][Garden.width] = new Plot(y, Garden.width);
    }
    Garden.width++;
    Garden.grid.push([]);
    for (let x = 0; x < Garden.width; x++) {
        Garden.grid[Garden.height][x] = new Plot(Garden.height, x);
    }
    Garden.height++;
    setGardenDisplay();
    closePlotMenu();
}

function run() {
    setInterval(() => {
        Garden.timer++;

        // step each plant, update their progress bars
        for (let y = 0; y < Garden.height; y++) {
            for (let x = 0; x < Garden.width; x++) {

                const thisPlot = Garden.grid[y][x];
                if (thisPlot.state == 2) {
                    const thisProgBar = document.querySelector("#progBar_" + thisPlot.id);
                    if (thisPlot.plant.step() == 0) {
                        // step() returns 1 when finished growing
                        thisProgBar.className = thisPlot.plant.watered ?
                            "plotProgBar progBarWatered" : "plotProgBar";
                        thisProgBar.style.width = (
                            (thisPlot.plant.timer / thisPlot.plant.growTime * 100)
                            + "%");
                    } else {
                        thisProgBar.className = "plotProgBar complete";
                    }
                }
            }
        }

        // update harvestBtn, waterBtn, timer
        if (selectedPlot) {
            if (selectedPlot.state == 2) {
                const thisPlant = selectedPlot.plant;
                if (thisPlant.timer >= thisPlant.growTime) {
                    // finished growing
                    Menus.plotMenu.harvestBtn.disabled = false;
                    Menus.plotMenu.plantTimer.style.visibility = "hidden";
                    Menus.plotMenu.waterBtn.disabled = true;
                    Menus.plotMenu.waterBtn.textContent = "💦";
                    Menus.plotMenu.waterBtn.className = "waterBtn";
                } else {
                    // still growing
                    Menus.plotMenu.harvestBtn.disabled = true;
                    Menus.plotMenu.plantTimer.style.visibility = "visible";
                    Menus.plotMenu.plantTimer.textContent = thisPlant.remainingTime;
                    Menus.plotMenu.waterBtn.disabled = false;
                    if (thisPlant.watered) {
                        Menus.plotMenu.waterBtn.className = "waterBtn watered";
                        Menus.plotMenu.waterBtn.textContent =
                            Math.ceil(thisPlant.waterTime / FPS);
                    } else {
                        Menus.plotMenu.waterBtn.className = "waterBtn";
                        Menus.plotMenu.waterBtn.textContent = "💦";
                    }
                }
            } else {
                Menus.plotMenu.harvestBtn.disabled = true;
                Menus.plotMenu.plantTimer.style.visibility = "hidden";
                Menus.plotMenu.waterBtn.disabled = true;
                Menus.plotMenu.waterBtn.className = "waterBtn";
                Menus.plotMenu.waterBtn.textContent = "💦";
            }
        }

        // autosave
        if (enableSave &&
            autoSave &&
            Garden.timer % (autosaveInterval * FPS) == 0) {
            save();
        }
    }, 1000 / FPS);
}

////////////////////////////////////////////////////
//                   DISPLAYS                     //
////////////////////////////////////////////////////

////// Garden //////
function setPlotDimensions(plotCont) {
    if (window.innerHeight > window.innerWidth) {
        plotCont.style.width = (window.innerWidth / Garden.width) - 20 + "px";
        plotCont.style.height = plotCont.style.width;
    } else {
        plotCont.style.height = (window.innerHeight / Garden.height) - 80 + "px";
        plotCont.style.width = plotCont.style.height;
    }
}

function setGardenDisplay() {
    gardenDiv.innerHTML = "";
    for (let y = 0; y < Garden.height; y++) {
        const row = document.createElement("div");
        row.className = "gardenRow";
        for (let x = 0; x < Garden.width; x++) {
            const thisPlot = Garden.grid[y][x];

            const iconCont = document.createElement("div");
            iconCont.className = "iconCont plotIcon";
            iconCont.id = y + "-" + x;
            setPlotDimensions(iconCont);
            iconCont.addEventListener("click", selectPlot);

            const icon = document.createElement("img");
            icon.className = "plotIconImg";
            icon.id = "icon_" + y + "-" + x;

            const tillIcon = document.createElement("img");
            tillIcon.className = "tillIcon";
            tillIcon.id = "till_" + y + "-" + x;
            tillIcon.src = "./assets/till.png";
            tillIcon.style.visibility = "hidden";
            tillIcon.addEventListener("click", () => { thisPlot.till(); });

            const progBar = document.createElement("div");
            progBar.className = "plotProgBar";
            progBar.id = "progBar_" + y + "-" + x;

            switch (thisPlot.state) {
                case 0:
                    icon.src = "./assets/grass.png";
                    progBar.style.visibility = "hidden";
                    break;
                case 1:
                    icon.src = "./assets/soil.png";
                    progBar.style.visibility = "hidden";
                    break;
                case 2:
                    icon.src = plants.imgs[thisPlot.plant.name];
                    progBar.style.visibility = "visible";
                    progBar.style.width =
                        thisPlot.plant.timer >= thisPlot.plant.growTime ?
                            "100%" : "0";
                    break;
            }

            iconCont.appendChild(icon);
            iconCont.appendChild(tillIcon);
            iconCont.appendChild(progBar);
            row.appendChild(iconCont);
        }
        gardenDiv.appendChild(row);
    }
}


////// Seed Menu //////
function setSeedMenu() {
    for (let seed in Inventories.Seeds) {

        const iconCont = document.createElement("div");
        iconCont.className = "iconCont seedIcon";
        iconCont.id = "seed" + seed;

        const icon = document.createElement("img");
        icon.className = "seedIconImg";
        icon.id = "seedIcon_" + seed;
        icon.src = plants.imgs[seed];

        const seedCount = document.createElement("span");
        seedCount.className = "seedCount";
        seedCount.id = seed + "Count";
        seedCount.textContent = Inventories.Seeds[seed];

        iconCont.appendChild(icon);
        iconCont.appendChild(seedCount);
        Menus.plotMenu.seedMenu.appendChild(iconCont);
    }
}


////////////////////////////////////////////////////////
//              STORAGE & INITIALIZATION              //
////////////////////////////////////////////////////////

function storageAvailable() {
    let storage;
    try {
        storage = window.localStorage;
        storage.setItem("STORAGE_TEST", "0");
        storage.removeItem("STORAGE_TEST");
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            e.name === "QuotaExceededError" &&
            storage &&
            storage.length !== 0
        );
    }
}
function plotData(plot) {
    this.state = plot.state;
    if (plot.state == 2) {
        this.name = plot.plant.name;
        this.timer = plot.plant.timer;
    }
}
export function save() {
    const saveData = {
        "Money": Money.amount,
        "Inventories": Inventories,
        "Garden": {
            "height": Garden.height,
            "width": Garden.width,
            "timer": Garden.timer,
            "grid": []
        }
    };
    for (let y = 0; y < Garden.height; y++) {
        saveData.Garden.grid.push([]);
    }
    for (let y = 0; y < Garden.height; y++) {
        for (let x = 0; x < Garden.width; x++) {
            saveData.Garden.grid[y][x] = new plotData(Garden.grid[y][x]);
        }
    }
    if (storageAvailable()) {
        const d = new Date(Date.now()).toLocaleString();
        localStorage.setItem("timestamp", d);
        localStorage.setItem("data", JSON.stringify(saveData));
        console.log("Saved at " + d);
    } else {
        console.log("Local storage not supported");
    }
}


////////// LOAD, INIT, RUN //////////
function load() {
    if (enableSave) {
        if (storageAvailable()) {
            let timestamp = localStorage.getItem("timestamp");
            let data = localStorage.getItem("data");
            if (data) {

                data = JSON.parse(data);
                if (data.Money) {
                    Money.amount = data.Money;
                } else {
                    Money.amount = 50;
                }
                Inventories = data.Inventories;
                Garden.timer = data.Garden.timer;
                Garden.width = data.Garden.width;
                Garden.height = data.Garden.height;
                Garden.grid = [];
                for (let y = 0; y < Garden.height; y++) {
                    Garden.grid.push([]);
                }

                for (let y = 0; y < Garden.height; y++) {
                    for (let x = 0; x < Garden.width; x++) {
                        const savedPlot = data.Garden.grid[y][x];
                        const thisPlot = new Plot(y, x);
                        thisPlot.state = savedPlot.state;
                        if (savedPlot.state == 2) {
                            thisPlot.plant = new plants[savedPlot.name]();
                            thisPlot.plant.timer = savedPlot.timer;
                        }
                        Garden.grid[y][x] = thisPlot;
                    }
                }
                console.log("Loaded data from " + timestamp);
            } else {
                console.log("Save data not found");
                newGame(4, 4);
            }
        } else {
            console.log("Storage not available");
            newGame(4, 4);
        }
    } else {
        console.log("Saving disabled");
        newGame(4, 4);
        Garden.grid[0][0].plant = new plants.Carrot();
        Garden.grid[0][0].state = 2;
        console.log(Garden);
    }
}

load();
setGardenDisplay();
setSeedMenu();
run();


////////////////////////////////////////////////////
//                    EVENTS                      //
////////////////////////////////////////////////////


////// Definitions //////

let selectedPlot = null;
let selectedSeed = null;

function updateMenu(menu) {
    switch (menu) {
        case "plotMenu":
            // harvestBtn, waterBtn handled in run()
            // title
            switch (selectedPlot.state) {
                case 0:
                    Menus.plotMenu.title.textContent = "Grassy Plot";
                    Menus.plotMenu.seedsBtn.disabled = true;
                    toggleSeedMenu("hide");
                    break;
                case 1:
                    Menus.plotMenu.title.textContent = "Soil";
                    Menus.plotMenu.seedsBtn.disabled = false;
                    break;
                case 2:
                    Menus.plotMenu.title.textContent = selectedPlot.plant.name;
                    Menus.plotMenu.seedsBtn.disabled = true;
                    toggleSeedMenu("hide");
                    break;
            }
            // reset seedMenu
            resetSeedMenu();
            deselectIcons("seeds");
            // get seed counts
            for (let seedIconDiv of getSeedIconDivs()) {
                const seed = seedIconDiv.id.slice(4);
                const cont = document.querySelector("#seed" + seed);
                const img = document.querySelector("#seedIcon_" + seed);
                const span = document.querySelector("#" + seed + "Count");
                if (Inventories.Seeds[seed] > 0) {
                    seedIconDiv.addEventListener("click", selectSeed);
                    cont.classList.remove("disabledIcon");
                    img.classList.remove("disabledImg");
                    span.textContent = Inventories.Seeds[seed];
                } else {
                    seedIconDiv.removeEventListener("click", selectSeed);
                    cont.classList.add("disabledIcon");
                    img.classList.add("disabledImg");
                    span.textContent = "";
                }
            }
            break;
        case "mainMenu":
            // inventory
            for (let seed in Inventories.Seeds) {
                const seedCount = document.querySelector("#invSeedCount_" + seed);
                seedCount.textContent = "Seeds: " + Inventories.Seeds[seed];
            }
            for (let plant in Inventories.Plants) {
                const plantCount = document.querySelector("#invPlantCount_" + plant);
                plantCount.textContent = plant + ": " + Inventories.Plants[plant];
            }
            break;
    }
}

function toggleMenu(menu) {
    updateMenu(menu);
    for (let m in Menus) {
        Menus[m].container.style.visibility =
            m == menu ? "visible" : "hidden";
    }
}

function selectPlot() {
    deselectIcons("plots");
    const Id = this.id.split("-").map(Number);
    selectedPlot = Garden.grid[Id[0]][Id[1]];
    console.log(selectedPlot);
    toggleMenu("plotMenu");
    if (selectedPlot.state == 0) {
        //toggleSeedMenu("hide");
        document.querySelector("#icon_" + selectedPlot.id).classList.add("covered");
        document.querySelector("#till_" + selectedPlot.id).style.visibility = "visible";
    }
    this.classList.add("selected");
}

function selectSeed() {
    selectedSeed = this.id.slice(4);
    Menus.plotMenu.newPlantBtn.disabled = false;
    deselectIcons("seeds");
    this.classList.add("selected");
}

function deselectIcons(...args) {
    for (const icon of args) {
        switch (icon) {
            case "plots":
                for (let p of getPlotDivs()) {
                    p.classList.remove("selected");
                }
                for (let covered of document.querySelectorAll(".covered")) {
                    covered.classList.remove("covered");
                }
                for (let tillIcon of document.querySelectorAll(".tillIcon")) {
                    tillIcon.style.visibility = "hidden";
                }
                break;
            case "seeds":
                for (let s of getSeedIconDivs()) {
                    s.classList.remove("selected");
                }
                break;
        }
    }
}

function resetSeedMenu() {
    Menus.plotMenu.newPlantBtn.disabled = true;
    selectedSeed = null;
    deselectIcons("seeds");
}
function toggleSeedMenu(action = "toggle") {
    switch (action) {
        case "toggle":
            Menus.plotMenu.seedsBtn.classList.toggle("selected");
            Menus.plotMenu.title.className =
                Menus.plotMenu.title.className == "fade-in" ? "fade-out" : "fade-in";
            Menus.plotMenu.seedMenuCont.className =
                Menus.plotMenu.seedMenuCont.className == "hide" ? "show" : "hide";
            break;
        case "show":
            Menus.plotMenu.seedsBtn.classList.add("selected");
            Menus.plotMenu.title.className = "fade-out";
            Menus.plotMenu.seedMenuCont.className = "show";
            Menus.plotMenu.plantTimer.className = "transparent";
            break;
        case "hide":
            Menus.plotMenu.seedsBtn.classList.remove("selected");
            Menus.plotMenu.title.className = "fade-in";
            Menus.plotMenu.seedMenuCont.className = "hide";
            Menus.plotMenu.plantTimer.className = "fade-in";
            break;
    }
}
function closePlotMenu() {
    Menus.plotMenu.container.style.visibility = "hidden";
    Menus.plotMenu.plantTimer.style.visibility = "hidden";
    toggleSeedMenu("hide");
    resetSeedMenu();
    deselectIcons("plots");
    selectedPlot = null;
    selectedSeed = null;
}

////// Plot Menu

Menus.plotMenu.seedsBtn.addEventListener("click", () => {
    toggleSeedMenu();
    resetSeedMenu();
});

Menus.plotMenu.harvestBtn.addEventListener("click", () => {
    if (selectedPlot && selectedPlot.state == 2) {
        selectedPlot.harvest();
    }
});

Menus.plotMenu.waterBtn.addEventListener("click", () => {
    if (selectedPlot && selectedPlot.state == 2) {
        selectedPlot.plant.water();
    }
});

Menus.plotMenu.closeBtn.addEventListener("click", closePlotMenu);

// seedIconBtns handled in updateMenu()

Menus.plotMenu.newPlantBtn.addEventListener("click", () => {
    if (selectedPlot && selectedSeed) {
        Menus.plotMenu.seedMenuCont.className = "hide";
        Menus.plotMenu.title.className = "fade-in";
        Menus.plotMenu.plantTimer.className = "fade-in";
        selectedPlot.newPlant(selectedSeed);
        selectedSeed = null;
    }
});

// Main Menu
Menus.mainMenu.btn.addEventListener("click", () => {
    for (let foldCont of document.querySelectorAll(".foldCont")) {
        foldCont.style.display = "none";
    }
    updateMenu("mainMenu");
    Menus.mainMenu.container.style.visibility =
        Menus.mainMenu.container.style.visibility ==
            "visible" ? "hidden" : "visible";
    Menus.market.container.style.visibility = "hidden";
});


// Window/Navigator Events
window.addEventListener("resize", setGardenDisplay);
