const container = document.querySelector("#carousel");
let scrollStart,
    scrollCenter,
    touchStart,
    dist,
    content = 0,
    pageLoaded = 0,
    contWidth = container.getBoundingClientRect().width,
    deadzone = contWidth * 0.25;

function carouselItem() {
    const item = document.createElement("div");
    item.className = "carousel-item";
    container.appendChild(item);
    return item;
}

const leftItem = carouselItem(),
    centerItem = carouselItem(),
    rightItem = carouselItem();

function setItems() {
    leftItem.textContent = content - 1;
    centerItem.textContent = content;
    rightItem.textContent = content + 1;
}

function snapCarousel(inDeadzone = 0) {
    if (!pageLoaded) {
        centerItem.scrollIntoView({ behavior: "instant", inline: "center" });
        scrollCenter = container.scrollLeft;
        return pageLoaded++;
    }
    if (!inDeadzone) {
        container.scrollLeft += dist < 0 ? contWidth : -contWidth;
    }

    // animate snap
    const startTime = Date.now(),
        startPos = container.scrollLeft,
        easeOutCubic = t => --t * t * t + 1,
        duration = 300,
        animSnap = timestamp => {
            const time = (Date.now() - startTime) / duration;
            container.scrollLeft =
                easeOutCubic(time) * (scrollCenter - startPos) + startPos;
            if (time < 1) requestAnimationFrame(animSnap);
        };
    requestAnimationFrame(animSnap);
}

function handleDown(e) {
    e.preventDefault();
    touchStart = e.clientX;
    scrollStart = container.scrollLeft;
}

function handleMove(e) {
    e.preventDefault();
    dist = touchStart - e.clientX;
    container.scrollLeft = scrollStart + dist;
}

function handleUp(e) {
    if (Math.abs(dist) > deadzone) {
        if (dist > 0) {
            // scroll right
            content++;
        } else {
            // scroll left
            content--;
        }
        setItems();
        snapCarousel();
    } else snapCarousel(1);
}

container.addEventListener("pointerdown", handleDown);
container.addEventListener("pointermove", handleMove);
container.addEventListener("pointerup", handleUp);
document.addEventListener("DOMContentLoaded", () => {
    setItems();
    snapCarousel();
});
window.addEventListener("resize", () => {
    pageLoaded = 0;
    contWidth = container.getBoundingClientRect().width,
    deadzone = contWidth * 0.25;
    snapCarousel();
});
