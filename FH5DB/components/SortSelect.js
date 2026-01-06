export class SortSelect {
    css = `
.container {
    display: flex;
}
select {
    margin: 0 6px;
}
.arrow {
    padding: 1px 6px 0;
    outline: 1px solid #777;
    border-radius: 2px;
    font-size: 10pt;
    vertical-align: middle;
}
`;
    constructor(element, options) {
        this._value = options[0];
        this.dir = "asc";
        this.onChange = null;

        const shadow = element.attachShadow({mode: "open"});
        const style = document.createElement("style");
        style.textContent = this.css;
        
        const container = document.createElement("div");
        container.className = "container";
        
        const label = document.createElement("label");
        label.textContent = "Sort by:";
        label.htmlFor = "select";
        
        this._select = document.createElement("select");
        this._select.id = "select";
        
        const arrow = document.createElement("div");
        arrow.className = "arrow";
        arrow.textContent = "\u2191 Asc";

        container.append(label, this._select, arrow);
        shadow.append(style, container);

        for (let opt of options) {
            const optEl = document.createElement("option");
            optEl.textContent = opt;
            optEl.value = opt;
            this._select.appendChild(optEl);
        }

        const toggleDir = () => {
            if (this.dir === "asc") {
                this.dir = "des";
                arrow.textContent = "\u2193 Desc";
            } else {
                this.dir = "asc";
                arrow.textContent = "\u2191 Asc";
            }
            if (this.onChange) this.onChange();
        };

        arrow.addEventListener("click", toggleDir);
        this._select.addEventListener("change", () => {
            this._value = this._select.value;
            if (this.onChange) this.onChange();
        });
    }
    
    set value(v) {
        this._value = v;
        this._select.value = v;
    }
    
    get value() {
        return this._value;
    }
}
