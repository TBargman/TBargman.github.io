import { getType, parseTime } from "./utility.js";

export function EventSchedule(startDate, endDate) {
    this.startDate = getType(startDate) === "Date" ? startDate : startDate; // yyyy-mm-dd
    this.endDate = endDate ? endDate : startDate;
    this.events = [];
    this.addEvent = function (name, startTime, endTime, notes) {
        // strings startTime & endTime use 2359 fmt
        // ex: 6:45pm = 1845, 3:15am = 0315
        this.events.push({
            name: name,
            startString: parseTime(startTime),
            startHour: parseInt(startTime.slice(0, 2)),
            startMin: parseInt(startTime.slice(2, 4)),
            endString: parseTime(endTime),
            endHour: parseInt(endTime.slice(0, 2)),
            endMin: parseInt(endTime.slice(2, 4)),
            end: endTime,
            notes: notes ? notes : null,
            // get times in hours:
            get startTime() {
                return (this.startHour * 60 + this.startMin) / 60;
            },
            get endTime() {
                return (this.endHour * 60 + this.endMin) / 60;
            },
            get duration() {
                return this.endTime - this.startTime;
            }
        });
    };
    this.removeEvent = function (name) {
        const i = this.events.findIndex((evt) => evt["name"] === name);
        if (i !== -1) this.events.splice(i, 1);
    };
    this.getSortedEvents = function () {
        return this.events.toSorted((a, b) => {
            if (a.startTime > b.startTime) return 1;
            if (a.startTime < b.startTime) return -1;
            return 0;
        });
    };
}


/*
const hmm = new EventSchedule("2025-06-18");
hmm.addEvent("name2", "0900", "1000");
hmm.addEvent("name", "0815", "0930");

console.log(hmm.sortedByStartTime());
*/