export function loadImg(src) {
    const img = new Image();
    img.src = src;
    return img;
}

export function newImg(src, clas) {
    const img = document.createElement("img");
    img.src = src;
    img.className = clas;
    return img;
}

export function wait(millisec) {
    const to = performance.now() + millisec;
    while (performance.now() < to) {}
}
