import { Inventories, Money } from "./main.js";
import * as plants from "./plants.js";


let marketPlants = ["Carrot", "Potato", "Tomato"];

export const marketMainCont = document.querySelector("#market");
const marketTitle = document.createElement("h2");
marketTitle.textContent = "Market";
marketTitle.id = "marketTitle";
marketTitle.className = "menuTitle";

const marketBackBtn = document.createElement("button");
marketBackBtn.id = "marketBackBtn";
marketBackBtn.addEventListener("click", () => { marketMainCont.style.visibility = "hidden"; });
const backIcon = document.createElement("img");
backIcon.src = "./assets/back-arrow.png";
marketBackBtn.appendChild(backIcon);

const modeSwitchCont = document.createElement("div");
modeSwitchCont.className = "flexBtnCont";
const modeSwitchBtn_buy = document.createElement("button");
modeSwitchBtn_buy.className = "modeSwitchBtn buySwitch";
modeSwitchBtn_buy.textContent = "Buy Seeds";
modeSwitchBtn_buy.style.zIndex = 11;
//modeSwitchBtn_buy.id = "modeSwitchBtn_buy";
const modeSwitchBtn_sell = document.createElement("button");
modeSwitchBtn_sell.className = "modeSwitchBtn sellSwitch";
modeSwitchBtn_sell.textContent = "Sell Plants";
modeSwitchBtn_sell.style.zIndex = 9;
//modeSwitchBtn_sell.id = "modeSwitchBtn_sell";
modeSwitchCont.appendChild(modeSwitchBtn_buy);
modeSwitchCont.appendChild(modeSwitchBtn_sell);

const marketItemsCont = document.createElement("div");
marketItemsCont.className = "marketItemsCont marketBuyCont";

marketMainCont.appendChild(marketTitle);
marketMainCont.appendChild(marketBackBtn);
marketMainCont.appendChild(modeSwitchCont);
marketMainCont.appendChild(marketItemsCont);

class marketItem {
    constructor(name) {
        this.name = name;
        this.buyPrice = plants[name].seedPrice;
        this.sellPrice = plants[name].sellPrice;

        this.container = document.createElement("div");
        this.invCount = document.createElement("span");
        this.container.className = "marketItem";
        this.invCount.className = "marketItemCount";

        const img = document.createElement("img");
        img.className = "marketImg";
        img.src = plants.imgs[this.name];
        this.tinyCoin = document.createElement("img");
        this.tinyCoin.className = "coin-tiny";
        this.tinyCoin.src = "./assets/coin-tiny.png";

        this.trade1 = document.createElement("div");
        this.trade1.btn = document.createElement("button");
        this.trade1.span = document.createElement("span");
        this.trade5 = document.createElement("div");
        this.trade5.btn = document.createElement("button");
        this.trade5.span = document.createElement("span");
        this.trade10 = document.createElement("div");
        this.trade10.btn = document.createElement("button");
        this.trade10.span = document.createElement("span");
        this.tradeMax = document.createElement("div");
        this.tradeMax.btn = document.createElement("button");
        this.tradeMax.span = document.createElement("span");
        this.trade1.mult = this.trade1.btn.textContent = 1;
        this.trade5.mult = this.trade5.btn.textContent = 5;
        this.trade10.mult = this.trade10.btn.textContent = 10;
        this.tradeMax.btn.textContent = "Max";
        this.tradeMax.span.textContent = "???";

        this.tradeMax.appendChild(this.tradeMax.btn);
        this.tradeMax.appendChild(this.tradeMax.span);
        this.tradeBtns = [this.trade1, this.trade5, this.trade10];

        this.container.appendChild(img);
        this.container.appendChild(this.invCount);
        for (let cont of this.tradeBtns) {
            cont.btn.className = "tradeBtn";
            cont.appendChild(cont.btn);
            cont.appendChild(cont.span);
            this.container.appendChild(cont);
        }
        this.container.appendChild(this.tradeMax);
    }
    buy(num) {
        Money.amount -= this.buyPrice * num;
        Inventories.Seeds[this.name] += num;
        //console.log("buy " + num);
    }
    sell(num) {
        Money.amount += this.sellPrice * num;
        Inventories.Plants[this.name] -= num;
        //console.log("sell " + num);
    }
    update() {
        // enable/disable btns, set maxbtn price
        // event listeners
        if (Money.mode == "buy") {
            this.invCount.textContent = Inventories.Seeds[this.name] ?? 0;
            this.invCount.style.color = "#083c71";
        } else if (Money.mode == "sell") {
            this.invCount.textContent = Inventories.Plants[this.name] ?? 0;
            this.invCount.style.color = "#590c03";
        }
        for (let cont of this.tradeBtns) {
            if (Money.mode == "buy") {
                cont.span.textContent = cont.mult * this.buyPrice;
                cont.span.style.color = "#083c71";
                cont.btn.disabled =
                    Money.amount < this.buyPrice * cont.mult ?
                        true : false;
                cont.btn.classList.add("buyBtn");
                cont.btn.classList.remove("sellBtn");
                cont.btn.onclick = () => {
                    this.buy(cont.mult);
                    this.update();
                };
            } else if (Money.mode == "sell") {
                cont.span.textContent = cont.mult * this.sellPrice;
                cont.span.style.color = "#590c03";
                cont.btn.disabled =
                    Inventories.Plants[this.name] < cont.mult ?
                        true : false;
                cont.btn.classList.add("sellBtn");
                cont.btn.classList.remove("buyBtn");
                cont.btn.onclick = () => {
                    this.sell(cont.mult);
                    this.update();
                };
            }
        }
        if (this.trade1.btn.disabled) {
            this.tradeMax.btn.disabled = true;
            this.tradeMax.span.innerHTML = "—";
        } else {
            let tradeAmt;
            this.tradeMax.btn.disabled = false;
            if (Money.mode == "buy") {
                this.tradeMax.btn.classList.add("buyBtn");
                this.tradeMax.btn.classList.remove("sellBtn");
                this.tradeMax.span.style.color = "#083c71";
                tradeAmt = Math.floor(Money.amount / this.buyPrice);
                this.tradeMax.span.textContent = tradeAmt * this.buyPrice;
                this.tradeMax.btn.onclick = () => {
                    this.buy(tradeAmt);
                    this.update();
                };
            } else if (Money.mode == "sell") {
                this.tradeMax.btn.classList.add("sellBtn");
                this.tradeMax.btn.classList.remove("buyBtn");
                this.tradeMax.span.style.color = "#590c03";
                tradeAmt = Inventories.Plants[this.name];
                this.tradeMax.span.textContent = tradeAmt * this.sellPrice;
                this.tradeMax.btn.onclick = () => {
                    this.sell(tradeAmt);
                    this.update();
                };
            }
        }
        for (let cont of this.tradeBtns) {
            const tinyCoin = document.createElement("img");
            tinyCoin.className = "coin-tiny";
            tinyCoin.src = this.tinyCoin.src;
            cont.span.appendChild(tinyCoin);
        }
        this.tradeMax.span.appendChild(this.tinyCoin);
    }
}

export function setMarketDisplay() {
    // main update func, called when market is opened
    // or when Money.mode switches
    marketItemsCont.innerHTML = "";
    switch (Money.mode) {
        case "buy":
            for (let seed in Inventories.Seeds) {
                const thisItem = new marketItem(seed);
                thisItem.update();
                marketItemsCont.appendChild(thisItem.container);
            }
            break;
        case "sell":
            for (let plant of marketPlants) {
                const thisItem = new marketItem(plant);
                thisItem.update();
                marketItemsCont.appendChild(thisItem.container);
            }
            break;
    }
}
function switchToSell() {
    if (Money.mode == "buy") {
        Money.mode = "sell";
        marketItemsCont.classList.add("marketSellCont");
        marketItemsCont.classList.remove("marketBuyCont");
        modeSwitchBtn_buy.style.zIndex = 9;
        modeSwitchBtn_sell.style.zIndex = 11;
        setMarketDisplay();
    }
}
function switchToBuy() {
    if (Money.mode == "sell") {
        Money.mode = "buy";
        marketItemsCont.classList.add("marketBuyCont");
        marketItemsCont.classList.remove("marketSellCont");
        modeSwitchBtn_buy.style.zIndex = 11;
        modeSwitchBtn_sell.style.zIndex = 9;
        setMarketDisplay();
    }
}
modeSwitchBtn_buy.addEventListener("click", switchToBuy);
modeSwitchBtn_sell.addEventListener("click", switchToSell);
