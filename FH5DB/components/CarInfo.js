function newE(parent, type, clas, content) {
    const e = document.createElement(type);
    if (parent) parent.appendChild(e);
    if (clas) e.className = clas;
    if (content) e.innerHTML = content;
    return e;
}

function numToCR(num) {
    let st = String(num);
    const commas = Math.ceil(st.length / 3) - 1;
    if (commas > 0)
        for (let i = 1; i < commas + 1; i++) {
            const pos = -(i * 3 + (i - 1));
            st = st.slice(0, pos) + "," + st.slice(pos);
        }
    return st + " CR";
}

export class CarInfo {
    rarityColors = {
        "Common": "#79CB43",
        "Rare": "#28CDFF",
        "Epic": "#D147EA",
        "Legendary": "#FDA816"
    };
    classColors = {
        "D": "#3EBFF6",
        "C": "#FFC338",
        "B": "#FF6A32",
        "A": "#FA3259",
        "S1": "#AF5DDB",
        "S2": "#195AD0",
        "X": "#02F33B"
    };
    flags = {
        "Australia": "🇦🇺",
        "Austria": "🇦🇹",
        "Canada": "🇨🇦",
        "China": "🇨🇳",
        "Croatia": "🇭🇷",
        "Denmark": "🇸🇪",
        "Dubai": "🇦🇪",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Great Britain": "🇬🇧",
        "Italy": "🇮🇹",
        "Japan": "🇯🇵",
        "Mexico": "🇲🇽",
        "Netherlands": "🇳🇱",
        "South Korea": "🇰🇷",
        "Spain": "🇪🇸",
        "Sweden": "🇸🇪",
        "United States": "🇺🇲"
    };

    css = `
* {
    box-sizing: border-box;
}

.main-header {
    background: var(--header-grad);
    padding: 6px 8px;
    margin-top: 2px;
    outline: 2px solid #113;
    border-top: 1.5px solid #fff5;
    border-bottom: 1.5px solid #0003;
    border-radius: 3px;
    color: white;
    font-size: 13pt;
    font-weight: 500;
    -webkit-text-stroke: 2px #0007;
    paint-order: stroke fill;
    /*
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    */
    
    &::before {
        content: "\u25BC";
        display: inline-block;
        transform: rotate(0) scale(1.1, 0.5);
        margin-right: 6px;
        transition: transform 250ms ease-in-out;
    }
    
    &.open::before {
        transform: rotate(-180deg) scale(1.1, 0.5);
    }
}

.result-container {
    position: relative;
    height: 0;
    width: 100%;
    transition: height 300ms;
    font-size: 10pt;
    
    &.open {
        height: 394px;
    }
}

.clip {
    clip-path: inset(0);
    height: 100%;
    width: 100%;
}

.results {
    font-family: sans-serif;
    padding: min(4%, 16px);
}

.stats-header {
    display: grid;
    grid-template-columns: auto 1fr;
    margin: 0 0 16px;
    border-bottom: 2px solid #555;
    align-items: end;
}

.cr-value {
    text-align: right;
    margin-bottom: 2px;
}

.stats-main {
    display: flex;
}

.stat-bars-cont {
    flex-grow: 1;
    display: inline-grid;
    grid-template-columns: auto 1fr;
}

.label-grid {
    display: inline-grid;
    grid-template-rows: repeat(6, 1fr);
}

.stats-grid {
    display: inline-grid;
    grid-template-rows: repeat(6, 1fr);
    gap: 1px 0;
    border-radius: 2px;
    background-image: linear-gradient(90deg, #f004, #ff03, #0f01);
    border: solid #bfb;
    border-width: 2px 2px 2px 0;
}

.stat-bar {
    outline: 1px solid black;
    border-top: 1px solid #fff6;
    border-bottom: 1px solid #0003;
    border-radius: 0 1px 1px 0;
    padding: 1px 4px 0 4px;
    /*-webkit-text-stroke: 1.5px #fff4;*/
    paint-order: stroke fill;
    
    &.top {
        border-radius: 1px 1px 1px 0;
    }
    &.bottom {
        border-radius: 0 1px 1px 1px;
    }
}

.stat-label {
    text-align: right;
    margin: 2px 6px 0 0;
}

.misc {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin-right: 12px;
}

.flag {
    font-size: 16pt;
}

.pi-class {
    display: inline-block;
    border: 3px solid var(--class-color);
    border-radius: 1px;
    background-color: white;
    padding: 1px 4px 0 0;
    font-weight: 800;
    font-size: 20px;
    margin-top: 6px;
    
    &::before {
        content: var(--class);
        background-color: var(--class-color);
        color: white;
        font-weight: 800;
        margin-right: 4px;
        padding: 1px 4px 1px 2px;
        position: relative;
        top: -0.5px;
        text-align: center;
    }
}

.rarity {
    background: var(--rarity-color);
    padding: 3px 6px;
    color: white;
    font-weight: 800;
    font-style: italic;
    text-align: center;
    white-space: nowrap;
    border-radius: 1px;
}

.avg-stat {
    display: inline-block;
    font-size: 42px;
    font-weight: 650;
    text-align: center;
    -webkit-text-stroke: 2.5px black;
    paint-order: stroke fill;
    &::after {
        content: "AVG";
        font-size: 10px;
        color: black;
        -webkit-text-stroke: 0;
        margin-left: 2px;
    }
}

.acquired-from-grid {
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    gap: 4px 8px;
}

.af-header {
    grid-column: 1 / 5;
    border: solid #555;
    border-width: 2px 0;
    text-align: center;
    margin-bottom: 10px;
    padding: 4px 0;
}

.af-label {
    text-align: right;
}

.has-note {
    grid-column: 1 / 2;
}

.af-note {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    grid-column: 3 / 5;
    border-bottom: 1px solid black;
}
`;
    constructor(parent, car) {
        const shadow = parent.attachShadow({mode: "open"});
        const style = newE(shadow, "style", null, this.css);

        const main = newE(shadow, "div", "main-container");

        let rarityColor, rarityHeaderColor;
        switch (car.Rarity) {
            case "Anniversary Edition":
                rarityColor = "linear-gradient(90deg, #fa5958, #fe06b0)";
                rarityHeaderColor = "linear-gradient(30deg, #515866, #898c8e 30%, #f97c7c 60%, #fe06b0)";
                break;
            case "Donut Edition":
                rarityColor = "linear-gradient(90deg, #fdc510, #ffae05)";
                rarityHeaderColor = "linear-gradient(30deg, #515866, #898c8e 30%, #fdc510 60%, #ffae05)";
                break;
            case "Forza Edition":
                rarityColor = "linear-gradient(90deg, #e420e0, #4672fa)";
                rarityHeaderColor = "linear-gradient(30deg, #515866, #898c8e 30%, #dd55da 60%, #4672fa 102%)";
                break;
            default:
                rarityColor = this.rarityColors[car.Rarity];
                rarityHeaderColor = `linear-gradient(20deg, #515866, #898c8e 35%, ${rarityColor} 90%)`;
                break;
        }

        const header = newE(main, "div", "main-header", `${car.Year} ${car.Manufacturer} ${car.Model}`);
        header.style.setProperty("--header-grad", rarityHeaderColor);

        const cont = newE(main, "div", "result-container");
        const clip = newE(cont, "div", "clip");
        const results = newE(clip, "div", "results");
        const statsHeader = newE(results, "h3", "stats-header");
        
        const flag = newE(null, "span", "flag", `${this.flags[car.Country]} `);
        const carType = newE(statsHeader, "div", "car-type", `"${car.Type}"`);
        newE(statsHeader, "div", "cr-value", numToCR(car.Value));
        carType.prepend(flag);

        const statsMain = newE(results, "div", "stats-main");
        const misc = newE(statsMain, "div", "misc");
        const statBarsCont = newE(statsMain, "div", "stat-bars-cont");

        const rarity = newE(misc, "div", "rarity", car.Rarity);
        rarity.style.setProperty("--rarity-color", rarityColor);

        const piClass = newE(misc, "div", "pi-class", car.PI);
        piClass.style.setProperty("--class", `'${car.PIClass}'`);
        piClass.style.setProperty("--class-color", this.classColors[car.PIClass]);

        const avgStat = newE(misc, "div", "avg-stat", car.AvgStat);
        avgStat.style.color = `hsl(${car.AvgStat * 12} 100% 45%)`;

        const labelGrid = newE(statBarsCont, "div", "label-grid");
        const barGrid = newE(statBarsCont, "div", "stats-grid");
        const statsList = ["Speed", "Handling", "Acceleration", "Launch", "Braking", "Offroad"];
        for (let i in statsList) {
            const s = statsList[i];
            const barClass = i === "0" ? "stat-bar top" : i === "5" ? "stat-bar bottom" : "stat-bar";
            const label = newE(labelGrid, "div", "stat-label", s);
            const bar = newE(barGrid, "div", barClass, car[s]);
            bar.style.width = `${car[s] * 10}%`;
            bar.style.backgroundImage = `linear-gradient(45deg, hsl(${car[s] * 12} 100% 55%), hsl(${
                car[s] * 12
            } 90% 70%))`;
        }

        const acquiredFrom = [
            "Autoshow",
            "Wheelspin",
            "Backstage",
            "Series/Season",
            "BarnFind",
            "DLC",
            "Collection",
            "Accolade",
            "Mastery"
        ];
        const afGrid = newE(results, "div", "acquired-from-grid");
        newE(afGrid, "h3", "af-header", "How to obtain:");
        for (let af of acquiredFrom) {
            let labelClass, label, info;
            if (af === "Collection" || af === "Accolade" || af === "Mastery") {
                labelClass = "af-label has-note";
                label = af + " Reward";
                info = car[af + "Name"];
            } else if (af === "DLC") {
                labelClass = "af-label has-note";
                label = af;
                info = car[af + "Name"];
            } else if (af === "Series/Season") {
                labelClass = "af-label";
                label = af + " Reward";
            } else if (af === "BarnFind") {
                labelClass = "af-label";
                label = "Barn Find";
            } else {
                labelClass = "af-label";
                label = af;
            }
            const icon = car[af] ? "✅" : "❌";
            newE(afGrid, "div", labelClass, label);
            newE(afGrid, "div", "af-icon", icon);
            if (info !== undefined) {
                newE(afGrid, "div", "af-note", info);
            }
        }

        let isOpen = false;
        header.addEventListener("click", () => {
            if (isOpen) {
                cont.classList.remove("open");
                header.classList.remove("open");
                isOpen = false;
            } else {
                cont.classList.add("open");
                header.classList.add("open");
                isOpen = true;
            }
        });
    }
}
