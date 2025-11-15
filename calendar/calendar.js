import * as cons from "./const.js";
import { newEl } from "./utility.js";
import { EventSchedule } from "./classes.js";
import * as dateView from "./dateView.js";

const rootHTML = document.querySelector(":root");
const mainEl = document.querySelector(".main");
const titleBarEl = document.querySelector("#titlebar");
let orientPortrait = window.innerHeight > window.innerWidth ? true : false;

const today = new Date();
const evChgView = new Event("chgView");
let year, month, day, mDate;

const Calendar = {
    el: document.querySelector("#calendar"),
    viewMode: "week",
    set view(view) {
        this.viewMode = view;
        window.dispatchEvent(evChgView);
        initCalendarView(today);
    },
    get view() {
        return this.viewMode;
    },
    Schedules: [],
    addEventSched: function (startDate, endDate) {
        this.Schedules.push(new EventSchedule(startDate, endDate ? endDate : startDate));
    }
};
Calendar.addEventSched("2025-09-18");
Calendar.Schedules[0].addEvent("1", "0030", "0730"); //1
Calendar.Schedules[0].addEvent("2", "0300", "0700"); //2
Calendar.Schedules[0].addEvent("3", "0600", "1000"); //3
Calendar.Schedules[0].addEvent("4", "0800", "1300"); //1

export function getEventSchedule(date) {
    // figure out something efficient
    for (let evSched of Calendar.Schedules) {
        if (evSched.startDate === date) {
            return evSched;
        }
    }
}

function initCalendarView(date) {
    // called when week/month/year view scrolls to next/prev
    year = date.getFullYear();
    month = date.getMonth();
    mDate = date.getDate();
    day = date.getDay();
    // check for leap year
    cons.DAYS_PER_MONTH[1] = ((year % 4 === 0 &&
        year % 100 !== 0) ||
        year % 400 === 0) ? 29 : 28;

    Calendar.el.innerHTML = "";
    switch (Calendar.view) {
        case "week":
            for (let w = -1; w < 2; w++) {

                month = date.getMonth();
                mDate = date.getDate() + 7 * w;
                if (mDate < 1) {
                    mDate += cons.DAYS_PER_MONTH[month - 1];
                    month--;
                } else if (mDate > cons.DAYS_PER_MONTH[month]) {
                    mDate -= cons.DAYS_PER_MONTH[month];
                    month++;
                }

                const weekView = newEl("div", "weekView");
                for (let i = 0; i < 7; i++) {

                    let thisDate = mDate - day + i;
                    let thisMonth = month;
                    let dateAdj = 0;
                    if (thisDate > cons.DAYS_PER_MONTH[month]) {
                        dateAdj = -cons.DAYS_PER_MONTH[month];
                        thisMonth++;
                    } else if (thisDate < 1) {
                        dateAdj = month === 0 ?
                            thisDate + 31 :
                            thisDate + cons.DAYS_PER_MONTH[month - 1];
                        thisMonth--;
                    }
                    thisDate += dateAdj;

                    const thisDateEl = newEl(
                        "div",
                        thisDate === date.getDate() ? "weekViewDay today" : "weekViewDay",
                        null,
                        thisDate + " " + cons.WEEKDAYS[i].slice(0, 3));
                    thisDateEl.date = year + "-" +
                        String(thisMonth + 1).padStart(2, "0") + "-" +
                        String(thisDate).padStart(2, "0");

                    const schedule = getEventSchedule(thisDateEl.date);
                    if (schedule) {
                        thisDateEl.textContent = thisDateEl.textContent +
                            ": " + schedule.events.length + " event(s)";
                    }
                    weekView.appendChild(thisDateEl);
                }
                Calendar.el.appendChild(weekView);
            }
            Calendar.el.scrollLeft = document.querySelector(".weekView").getBoundingClientRect().width;
            break;

        case "month":

            // table headers
            const monthView = newEl("table", "monthView");
            const header = newEl("tr", "monthViewHeader");
            monthView.appendChild(header);
            for (let h = 0; h < 7; h++) {
                header.appendChild(newEl("th", null, null, cons.WEEKDAYS[h].slice(0, 3)));
            }

            // counters
            let c, cEnd, dateNum, tdClass;
            c = cEnd = 1;
            let prevMonthDays = mDate === 1 ?
                day : day - ((mDate - 1) % 7);
            prevMonthDays += prevMonthDays < 0 ? 7 : 0;

            // how many weeks?
            let weeksShown = 4;
            if (prevMonthDays + cons.DAYS_PER_MONTH[month] > 28) {
                weeksShown++;
                if (prevMonthDays + cons.DAYS_PER_MONTH[month] > 35) {
                    weeksShown++;
                }
            }

            // fill table
            if (!orientPortrait) monthView.style.height = "100%";
            for (let w = 0; w < weeksShown; w++) {
                const thisRow = newEl("tr");
                if (orientPortrait) thisRow.style.height = 50 / weeksShown + "vh";
                for (let d = 0; d < 7; d++) {

                    if (prevMonthDays > 0) {
                        prevMonthDays--;
                        dateNum = month === 0 ?
                            31 - prevMonthDays :
                            cons.DAYS_PER_MONTH[month - 1] - prevMonthDays;
                        tdClass = "monthView otherMonth";
                    } else if (c <= cons.DAYS_PER_MONTH[month]) {
                        dateNum = c;
                        tdClass = "monthView";
                        tdClass += (w + d) % 2 === 0 ? " even" : " odd";
                        tdClass += c === mDate ? " today" : "";
                        c++;
                    } else {
                        dateNum = cEnd;
                        tdClass = "monthView otherMonth";
                        cEnd++;
                    }

                    thisRow.appendChild(newEl(
                        "td", tdClass, null, dateNum));
                }
                monthView.appendChild(thisRow);
            }
            Calendar.el.appendChild(monthView);

            break;
        case "year":

            break;
    }
    //console.log(grid);
}

function updateCalendarView(){
    
}

function testMonths(year) {
    let c = 0;
    for (let month = 0; month < 12; month++) {
        for (let i = 1; i < cons.DAYS_PER_MONTH[month] + 1; i++) {
            c++;
            const d = year + "-" +
                String(month + 1).padStart(2, "0") + "-" +
                String(i).padStart(2, "0") + "T06:00:00";
            setTimeout(() => {
                console.log(d);
                initCalendarView(new Date(d));
            }, c * 250);
        }
    }
}

document.addEventListener("load", initCalendarView(today));
document.addEventListener("pointerup", (ev) => {
    //console.log(ev.target);
    if (ev.target.className === "weekViewDay" ||
        ev.target.className === "weekViewDay today") {
        mainEl.style.filter = "blur(5px)";

        if (ev.target.date && dateView.dateView.hidden) {
            //console.log(ev.target.date);
            // handle dateviewer things specific to this date
            dateView.update(ev.target.date);
            dateView.show();
        } else {
            console.log("Selected day does not have date property!");
        }
    } else if (ev.target.id === "dateViewCloseBtn") {
        mainEl.style.filter = "blur(0)";
        dateView.hide();
    }
});
Calendar.el.addEventListener("scrollend", (e) => { console.log(e); });
//window.addEventListener("resize", () => { orientPortrait = window.innerHeight > window.innerWidth ? true : false; });
//document.querySelector("#colorBtn").addEventListener("click", () => { rootHTML.style.setProperty("--primary-hue", Math.random()*360); });content://com.android.externalstorage.documents/tree/primary%3ACODE::primary:CODE/Web/calendar/js/calendar.js