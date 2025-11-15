export function rndRGB() {
    return [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)];
}

export function rgb2hex([r, g, b]) {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function rgb2hsl([r, g, b]) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = 0,
        min = 1;
    for (let v of [r, g, b]) {
        if (max < v) max = v;
        if (min > v) min = v;
    }
    const a = max + min,
        d = max - min,
        l = Math.round(a * 500) / 10,
        s = max === min ? 0 : l > 50 ? Math.round((d / (2 - a)) * 1000) / 10 : Math.round((d / a) * 1000) / 10;
    let h;
    if (s) {
        switch (max) {
            case r:
                h = (g - b) / d;
                break;
            case g:
                h = 2 + (b - r) / d;
                break;
            case b:
                h = 4 + (r - g) / d;
                break;
        }
    } else h = 0;
    h *= 60;
    if (h < 0) h += 360;
    return [Math.round(h), s, l];
}
