export class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    copy() {
        return new vec2(this.x, this.y);
    }
    getNormal() {
        return new vec2(this.y, -this.x);
    }
    normalized() {
        if (this.x + this.y !== 1) {
            const d = this.length;
            const x = this.x / d;
            const y = this.y / d;
            return new vec2(x, y);
        }
        return this;
    }
    flip() {
        this.x = -this.x;
        this.y = -this.y;
    }
    flipped() {
        return new vec2(-this.x, -this.y);
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    add(other) {
        return new vec2(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        return new vec2(this.x - other.x, this.y - other.y);
    }
    scale(n) {
        return new vec2(this.x * n, this.y * n);
    }
    reflect(axis) {
        // v' = v - 2*(v · a)*a
        const coeff = 2 * this.dot(axis);
        const r = axis.scale(coeff);
        return this.subtract(r);
    }
    
}
