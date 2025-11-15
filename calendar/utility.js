export function newEl(tag, className, id, content) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (id) el.id = id;
    if (content) el.textContent = content;
    return el;
}

export function applyStyle(element, styleObj){
    for (let s in styleObj){
        element.style.s = styleObj[s];
    }
}

export function intWrap(i, l, u) {
    const m = u - l + 1;
    if (i > u)
        return l + ((i - u - 1) % m);
    if (i < l)
        return u - ((l - i - 1) % m);
    return i;
}

export function parseTime(time, AmPm = true) {
    // converts 2359 to hh:mm
    let st = time.slice(0, 2);
    let pm = false;
    if (st === "00") st = "12";
    else if (parseInt(st) > 12) {
        st = String(parseInt(st) - 12);
        pm = true;
    } else if (parseInt(st) < 10) st = st.slice(1);
    st += ":" + time.slice(2, 4);
    if (AmPm) st += pm ? "pm" : "am";
    return st;
}

export function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

//console.log(getType(new Date()));