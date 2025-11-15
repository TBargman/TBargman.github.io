import * as cons from "./const.js";
import { newEl, parseTime, getType } from "./utility.js";
import { getEventSchedule } from "./calendar.js";

export const dateView = {
    hidden: true,
    el: document.querySelector(".dateViewMain"),
    closeBtn: document.querySelector("#dateViewCloseBtn"),
    title: document.querySelector(".dateViewTitle"),
    schedule: document.querySelector("#dateViewSchedule"),
    eventMain: document.querySelector("#dateViewEvent"),
    eventName: document.querySelector(".dateViewEventName"),
    eventTimes: document.querySelector(".dateViewEventTimes"),
    eventNotes: document.querySelector(".dateViewEventNotes")
};

dateView.el.style.opacity = 0;
dateView.el.addEventListener("transitionend", () => {
    if (dateView.hidden) {
        dateView.el.style.zIndex = -1;
    }
});

// create schedule timeline
dateView.schedule.innerHTML = "";
for (let x = 0; x < 2; x++) {
    const st = x === 0 ? "am" : "pm";
    for (let h = 0; h < 12; h++) {
        const box = newEl("div");
        const time = h ? h : 12;
        box.appendChild(newEl("span", null, null, time + st));
        dateView.schedule.appendChild(box);
    }
}
dateView.schedule.appendChild(newEl("div", null, "scheduleEventCont"));

export function update(date) {

    // header
    const dRef = getType(date) === "Date" ? date : new Date(date + "T06:00:00");
    dateView.title.textContent =
        cons.WEEKDAYS[dRef.getDay()] +
        ", " + cons.MONTHS[dRef.getMonth()].slice(0, 3) +
        " " + dRef.getDate();

    // add event bars to timeline
    const evSched = getEventSchedule(date);
    const eventCont = document.querySelector("#scheduleEventCont");
    eventCont.innerHTML = "";
    if (evSched) {

        // group non-overlapping events:
        // each group draws its event bars
        // to the right of the prev group
        const events = evSched.getSortedEvents();
        let groups = [];
        
        let currentGroup, currentEvent;
        while (events.length > 0) {
            groups.push([]);
            currentGroup = groups.length - 1;
            groups[currentGroup].push(events.shift());
            currentEvent = groups[currentGroup][groups[currentGroup].length - 1];
            for (let g = 0; g < events.length; g++) {
                if (events[g].startTime >= currentEvent.endTime) {
                    groups[currentGroup].push(events.splice(g, 1)[0]);
                }
            }
        }
        
        // add bars and position
        cons.stylesheet.insertRule(".eventItem { width: " + (100 / groups.length - 1) + "%");
        for (let g = 0; g < groups.length; g++) {
            for (let e = 0; e < groups[g].length; e++) {
                const ev = groups[g][e];
                const eventItem = newEl("div", "eventItem", null, ev.name);
                eventItem.style.top = "calc(" +
                    (4 * ev.startTime + 2) + "vmax + " +
                    2 * ev.startTime + "px)"; // + border
                eventItem.style.height = "calc(" +
                    4 * ev.duration + "vmax + " +
                    (2 * ev.duration - 10) + "px)"; // +border, -padding
                eventItem.style.left = (g * 100 / groups.length) + "%";
                eventCont.appendChild(eventItem);
            }
        }
    }
}

export function show() {
    dateView.hidden = false;
    dateView.el.style.opacity = 1;
    dateView.el.style.zIndex = 1;
    dateView.el.style.transform = "scale(1)";
    dateView.schedule.scrollTop = 0;
}

export function hide() {
    dateView.hidden = true;
    dateView.el.style.transform = "scale(1.25)";
    dateView.el.style.opacity = 0;
}