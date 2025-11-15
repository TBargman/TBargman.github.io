import { FPS } from "./main.js";

const maxWaterTime = 15;
const wateredStep = 3;

class Plant {
    constructor() {
        this.name = "";
        this.timer = 0;
        this.growTime;
        this.remainingTime = 0;
        this.growTime = 1;
        this.watered = false;
        this.waterTime = maxWaterTime * FPS;
    }
    water() { this.watered = true; }
    step() {
        if (this.watered) { this.waterTime--; }
        if (this.waterTime < 0) {
            this.watered = false;
            this.waterTime = maxWaterTime * FPS;
        }
        if (this.timer < this.growTime) {
            let secsRemaining = Math.ceil(this.growTime - this.timer);
            this.remainingTime =
                Math.floor(secsRemaining / 60) + ":" + String(secsRemaining % 60).padStart(2, "0");
            this.timer += this.watered ?
                wateredStep / FPS : 1 / FPS;
            return 0;
        } else {
            this.watered = false;
            return 1;
        }
    }
}
class Carrot extends Plant {
    static get sellPrice() { return 3; }
    static get seedPrice() { return 1; }
    constructor() {
        super();
        this.name = "Carrot";
        this.growTime = 3;
        this.seedYield = 3;
    }
}
class Potato extends Plant {
    static get sellPrice() { return 2; }
    static get seedPrice() { return 1; }
    constructor() {
        super();
        this.name = "Potato";
        this.growTime = 60;
        this.seedYield = 3;
    }
}
class Tomato extends Plant {
    static get sellPrice() { return 3; }
    static get seedPrice() { return 2; }
    constructor() {
        super();
        this.name = "Tomato";
        this.growTime = 90;
        this.seedYield = 3;
    }
}
const imgs = {
    Soil: "./assets/soil.png",
    Carrot: "./assets/carrot.png",
    Potato: "./assets/potato.png",
    Tomato: "./assets/tomato2.png"
};

export {
    maxWaterTime,
    imgs,
    Plant,
    Carrot,
    Potato,
    Tomato
};