/********* TO DO:
 * does FilterForm._changeFunc() work with arguments? does it need to?
 * loading animation when scrolling?
 */

"use strict";

import {data} from "./FH5DB_clean.js";
import {FilterForm} from "./components/FilterForm.js";
import {SortSelect} from "./components/SortSelect.js";
import {CarInfo} from "./components/CarInfo.js";

let resultsData;
let sortKey = "Year";
let numResults = 30;
let numResultsLoaded = 0;
let loadingResults = false;

// num px from the bottom needed to scroll to
// before loading more results
const scrollTrigger = 10;

const filters = [
    "Country",
    "Manufacturer",
    {name: "Model", requires: ["Manufacturer"]},
    "Year",
    "Type",
    "Rarity",
    "Value",
    "PIClass",
    {
        group: "Unlocked from:",
        filters: [
            "Autoshow",
            "Wheelspin",
            {name: "BarnFind", label: "Barn Find"},
            "Accolade",
            {name: "Collection", label: "Collection Reward"},
            {name: "Mastery", label: "Car Mastery"},
            "Backstage",
            "DLC",
            {name: "Series/Season", label: "Series/Season Reward"}
        ]
    }
];

const rarityVals = {
    "Common": 0,
    "Rare": 1,
    "Epic": 2,
    "Legendary": 3,
    "Forza Edition": 4,
    "Donut Edition": 4,
    "Anniversary Edition": 4
};

const sortKeys = ["Manufacturer", "Country", "Year", "Type", "Rarity", "Value", "PI"];

const filterMenuElement = document.querySelector("#filterMenu");
const menuTitle = document.querySelector(".menu-title");
const backdrop = document.createElement("div");
const resultsMain = document.querySelector("#results-main");
const resCount = document.createElement("div");
const resSort = document.createElement("div");
const resCont = document.createElement("div");

backdrop.className = "backdrop";
resCount.id = "result-count";
resSort.id = "result-sort";
resCont.id = "result-cont";
document.body.appendChild(backdrop);
resultsMain.appendChild(resCount);
resultsMain.appendChild(resSort);
resultsMain.appendChild(resCont);

const sortSelect = new SortSelect(resSort, sortKeys);
const filterForm = new FilterForm(data, filters);
filterMenuElement.appendChild(filterForm.main);
sortSelect.onChange = resetResults;
filterForm.onChange = resetResults;

function sortResults() {
    // called on reset
    sortKey = sortSelect.value;
    const t = typeof resultsData[0][sortKey];
    if (t === "number") {
        resultsData.sort((a, b) => a[sortKey] - b[sortKey]);
    } else {
        if (sortKey === "Rarity") {
            resultsData.sort((a, b) => rarityVals[a.Rarity] - rarityVals[b.Rarity]);
        } else {
            resultsData.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) return -1;
                if (a[sortKey] > b[sortKey]) return 1;
                return 0;
            });
        }
    }
    if (sortSelect.dir === "des") resultsData.reverse();
}

function loadResults() {
    // called on reset or when scrolled to the bottom
    const k = Object.keys(resultsData);
    for (let i = numResultsLoaded; i < numResults + numResultsLoaded; i++) {
        if (i >= resultsData.length) break;
        const car = resultsData[k[i]];

        const result = document.createElement("div");
        result.className = "car-info";
        const carInfo = new CarInfo(result, car);
        resCont.appendChild(result);
    }
    loadingResults = false;
    numResultsLoaded += numResults;
}

function resetResults() {
    // called on change in filter form,
    // or when sortKey changes
    numResultsLoaded = 0;
    resultsData = filterForm.getFilteredData();
    resCount.textContent = `${resultsData.length} Results`;
    sortResults();
    resCont.innerHTML = "";

    // fill page until it overflows to enable scrolling
    while (resCont.clientHeight < resultsMain.clientHeight && numResultsLoaded < resultsData.length) {
        loadResults();
    }
}

//////////// EVENTS ////////////

let isAnim = false;
let menuOpen = false;

function openMenu(e) {
    if (!menuOpen && !isAnim) {
        resultsMain.style.animationName = "open-filters";
        resultsMain.className = "filters-open";
        filterMenuElement.className = "filters-open";
        menuTitle.className = "menu-title hide";
        backdrop.style.visibility = "visible";
        isAnim = true;
        menuOpen = true;
    }
}

function closeMenu(e) {
    if (menuOpen && !isAnim) {
        resultsMain.style.animationName = "close-filters";
        resultsMain.className = "filters-closed";
        filterMenuElement.className = "filters-closed";
        menuTitle.className = "menu-title show";
        backdrop.style.visibility = "hidden";
        isAnim = true;
        menuOpen = false;
    }
}

function scrollToLoad() {
    const scrollPos = resultsMain.scrollTop + resultsMain.clientHeight;
    if (!loadingResults && scrollPos + scrollTrigger > resultsMain.scrollHeight) {
        loadingResults = true;
        loadResults();
    }
}

function resizeMenu() {
    const closedMenuHeight = parseFloat(
        window.getComputedStyle(document.documentElement).getPropertyValue("--closed-point")
    );
    const filterFormRect = filterForm.form.getBoundingClientRect();
    document.body.style.setProperty("--open-point", `${filterFormRect.height + closedMenuHeight * 2}px`);
}

//////////// INIT ////////////

resizeMenu();
resetResults();

// Events
filterMenuElement.addEventListener("click", openMenu);
backdrop.addEventListener("click", closeMenu);
resultsMain.addEventListener("scroll", scrollToLoad);
resultsMain.addEventListener("animationend", () => {
    isAnim = false;
});
window.addEventListener("resize", resizeMenu);
