import { imgs } from "./plants.js";
import { Inventories, expandGarden, save } from "./main.js";
import { setMarketDisplay, marketMainCont } from "./market.js";


const MainMenu = {
    element: document.querySelector("#mainMenu")
};

class menuItem {
    constructor(name, func) {
        this.name = name;

        this.element = document.createElement("div");
        this.element.className = "mainMenuItem";
        this.element.id = "mainMenu_" + name;
        this.element.textContent = name;
        MainMenu.element.appendChild(this.element);

        this.action = func;
        if (func) {
            this.element.addEventListener("click", func);
        }
    }
    setAction(func) {
        this.element.removeEventListener("click", this.action);
        this.action = func;
        this.element.addEventListener("click", func);
    }
}

class foldItem {
    constructor(name, ...subItems) {
        this.name = name;

        this.mainCont = document.createElement("div");
        this.mainCont.className = "foldItem";
        MainMenu.element.appendChild(this.mainCont);

        this.mainBtn = document.createElement("div");
        this.mainBtn.className = "mainMenuItem";
        this.mainBtn.id = "mainMenu_" + name;
        this.mainBtn.textContent = name;
        this.mainCont.appendChild(this.mainBtn);

        this.foldCont = document.createElement("div");
        this.foldCont.className = "foldCont";
        this.foldCont.id = "mainMenu_" + this.name + "_foldItem";
        this.foldCont.style.display = "none";
        this.mainCont.appendChild(this.foldCont);
        this.mainBtn.addEventListener("click", () => {
            this.foldCont.style.display = this.foldCont.style.display == "none" ? "flex" : "none";
        });

        this.subElements = {};
        for (const item of subItems) {

            if (typeof item == "string") {
                this.subElements[item] = document.createElement("div");
                this.subElements[item].id = "mainMenu_" + name + "Cont";
                this.subElements[item].className = "container foldSubItem";
                this.subElements[item].textContent = item;
                this.foldCont.appendChild(this.subElements[item]);
            } else {
                // HTML element
                this.subElements[item.id] = item;
                this.subElements[item.id].className = "container foldSubItem";
                this.foldCont.appendChild(this.subElements[item.id]);
            }
        }
    }
}

// Inventory foldItem
const mainMenuInventory = document.createElement("div");
mainMenuInventory.id = "menuInventory";
for (let seed in Inventories.Seeds) {

    const thisItem = document.createElement("div");
    thisItem.id = "mainInv_" + seed;
    thisItem.className = "invItem";

    let seedIcon = document.createElement("img");
    seedIcon.src = imgs[seed];
    seedIcon.className = "invIcon";

    const plantCount = document.createElement("div");
    plantCount.id = "invPlantCount_" + seed;
    plantCount.className = "invPlantCount";
    plantCount.textContent =
        Inventories.Plants[seed] ?
            seed + ": " + Inventories.Plants[seed] : seed + ": 0";

    const seedCount = document.createElement("div");
    seedCount.id = "invSeedCount_" + seed;
    seedCount.className = "invSeedCount";
    seedCount.textContent = "Seeds: " + Inventories.Seeds[seed];

    thisItem.appendChild(seedIcon);
    thisItem.appendChild(plantCount);
    thisItem.appendChild(seedCount);
    mainMenuInventory.appendChild(thisItem);
}

MainMenu.items = {
    inventory: new foldItem("Inventory", mainMenuInventory),
    market: new menuItem("Market", () => { setMarketDisplay(); marketMainCont.style.visibility = "visible"; }),
    settings: new menuItem("Settings", () => { console.log("Settings"); }),
    expand: new menuItem("Expand", expandGarden)
};

const saveText = document.createElement("span");
saveText.textContent = "Saved!";
saveText.className = "saveText";
saveText.addEventListener("transitionend", () => {
    saveText.className = "saveText";
    saveText.style.visibility = "hidden";
});
MainMenu.element.appendChild(saveText);

const saveBtn = new menuItem("Save", () => {
    save();
    saveText.style.visibility = "visible";
    saveText.className = "saveText fade-out delay";
});
