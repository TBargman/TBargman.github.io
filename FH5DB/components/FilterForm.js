import {MinMaxDataSlider} from "./MinMaxDataSlider.js";
import {ToggleBox} from "./ToggleBox.js";

function newE(type, clasname, id, content) {
    const e = document.createElement(type);
    if (clasname) e.className = clasname;
    if (id) e.id = id;
    if (content) e.innerHTML = content;
    return e;
}

function newInput(type, id) {
    const l = document.createElement("label");
    l.htmlFor = id;

    let inp;
    if (type === "select") {
        inp = document.createElement("select");
    } else {
        inp = document.createElement("input");
        inp.type = type;
    }
    inp.id = id;
    return [inp, l];
}

function fAdd(data, filter) {}

function fSub(data, filter) {}

function min(arr) {
    let min = Infinity;
    for (let i of arr) if (i < min) min = i;
    return min;
}

function max(arr) {
    let max = -Infinity;
    for (let i of arr) if (i > max) max = i;
    return max;
}

export class FilterForm {
    // TO DO:
    // are toggleboxes working right?
    // radiogroups
    
    css = `
form {
    --yMargin: 3px;
}

.form-group {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 0 4px;
}

.group-header {
    border-bottom: 2px solid #0006;
    margin-bottom: 8px;
}

.l1 {
    font-size: 13pt;
}

.l2 {
    font-size: 12pt;
    font-style: italic;
    font-weight: 600;
    &::before {
        content: "> ";
    }
}

.l3 {
    font-size: 12pt;
    font-weight: 400;
    &::before {
        content: ">> ";
    }
}

.togglebox {
    margin: var(--yMargin) 6px;
}

select {
    margin: var(--yMargin) 6px;
    width: 80%;
}

.range-input {
    width: 75%;
    margin: calc(var(--yMargin) + 18px) 0 calc(var(--yMargin) + 24px) 12px;
}

label {
    text-align: right;
}

.form-controls {
    margin-top: 16px;
    text-align: center;
}

button {
    
}
`;

    constructor(data, filters) {
        this.main = newE("div", "FiltersForm");
        this.form = newE("form");
        this._data = data;
        this._filteredData = data;
        this._filters = filters;
        this._inputs = {};
        
        this._changeFuncDefault = (filter = true) => {
            if (filter) this.filterData();
            this.updateForm();
        };
        this._changeFunc = this._changeFuncDefault;

        const shadow = this.main.attachShadow({mode: "closed"});
        const style = document.createElement("style");
        style.textContent = this.css;
        shadow.appendChild(style);
        shadow.appendChild(this.form);

        const getInputData = f => {
            // used to fill input elements with relevant data:
            //     select inputs with options,
            //     MinMaxDataSlider inputs with numerical data
            const fData = new Set();
            for (let entry of data) fData.add(entry[f]);
            fData.delete("");
            return [...fData];
        };

        // create form elements
        // iterate thru filter array recursively for subgroups
        let recursion = 1;
        const maxHeaderLevels = 3;
        const buildForm = filterArr => {
            const gridGroup = newE("div", "form-group");
            this.form.appendChild(gridGroup);
            for (let filter of filterArr) {
                const ft = typeof filter;
                const isObj = ft === "object";
                let inputType, inputValue, inputEl, labelEl;

                if (ft === "string" || (isObj && "name" in filter)) {
                    //// DEFAULT OPTION ////
                    // create input based on data type
                    // checks for string, number or boolean

                    const filterName = isObj ? filter.name : filter;
                    const dt = typeof data[0][filterName];
                    switch (dt) {
                        case "string":
                            [inputEl, labelEl] = newInput("select", `input-${filterName}`);
                            inputType = "select";
                            
                            // options generated in updateForm()
                            gridGroup.appendChild(labelEl);
                            gridGroup.appendChild(inputEl);
                            break;

                        case "number":
                            inputType = "range";
                            const inputData = getInputData(filterName).sort((a, b) => a - b);
                            inputEl = new MinMaxDataSlider(inputData);
                            inputEl.main.className = "range-input";
                            inputEl.main.id = `input-${filterName}`;
                            labelEl = newE("label");
                            gridGroup.appendChild(labelEl);
                            gridGroup.appendChild(inputEl.main);
                            break;

                        case "boolean":
                            inputType = "togglebox";
                            const container = newE("div", "togglebox");
                            inputEl = new ToggleBox(container);
                            labelEl = inputEl.label;
                            gridGroup.appendChild(container);
                            break;
                    }

                    // set label text
                    labelEl.prepend(isObj && "label" in filter ? filter.label : filterName);

                    // save input data
                    const req = isObj && "requires" in filter ? filter.requires : null;
                    this._inputs[filterName] = {
                        name: filterName,
                        type: inputType,
                        element: inputEl,
                        requires: req
                    };

                    // handle groups
                } else if (isObj && !("name" in filter)) {
                    if ("radiogroup" in filter) {
                        // TO DO: radio group
                    } else if ("group" in filter) {
                        // create header, start recursion
                        this.form.appendChild(newE("h4", `group-header l${recursion}`, null, filter.group));
                        if (recursion < maxHeaderLevels) recursion++;
                        buildForm(filter.filters);
                    }
                }
            }
        };

        buildForm(filters);
        this.updateForm();

        // handle requires
        for (let k in this._inputs) {
            const i = this._inputs[k];
            if (i.requires) {
                i.element.disabled = true;
                for (let req of i.requires) {
                    const requiredInput = shadow.querySelector(`#input-${req}`);
                    requiredInput.addEventListener("change", function () {
                        i.element.disabled = !(this.value && this.value !== "*");
                    });
                }
            }
        }

        // add reset button
        const btnCont = newE("div", "form-controls");
        const resetBtn = newE("button", null, null, "Reset");
        resetBtn.type = "button";
        btnCont.appendChild(resetBtn);
        this.form.appendChild(btnCont);
        resetBtn.addEventListener("click", () => this.resetForm());
    }

    set onChange(func) {
        if (this._changeFunc) {
            for (let k in this._inputs) {
                const i = this._inputs[k];
                if (i.type === "select") i.element.removeEventListener("change", this._changeFunc);
            }
        }
        this._changeFunc = (filter = true) => {
            if (filter) this.filterData();
            this.updateForm();
            if (func) func();
        };
        for (let k in this._inputs) {
            const i = this._inputs[k];
            if (i.type === "range" || i.type === "togglebox") i.element.onChange = this._changeFunc;
            else i.element.addEventListener("change", this._changeFunc);
        }
    }
    
    get onChange() { return this._changeFunc; }

    filterData() {
        // check if no filters set
        const toFilter = [];
        for (let k in this._inputs) if (this._inputs[k].element.value !== "*") toFilter.push(this._inputs[k]);
        if (toFilter.length === 0) return;

        let fData = JSON.parse(JSON.stringify(this._data));
        for (let k in toFilter) {
            const input = toFilter[k];

            switch (input.type) {
                case "range":
                    const rangeData = input.element.getDataBetween();
                    fData = fData.filter(
                        entry => entry[input.name] >= rangeData[0] && entry[input.name] <= rangeData.at(-1)
                    );
                    break;
                case "select":
                    fData = fData.filter(entry => entry[input.name] === input.element.value);
                    break;
                case "checkbox":
                    if (input.element.checked) fData = fData.filter(entry => entry[input.name] === true);
                    break;
                case "togglebox":
                    // i forgor what i wanted to do here
                    if (input.element.state === "on") fData = fData.filter(entry => entry[input.name] === true);
                    else if (input.element.state === "off") fData = fData.filter(entry => entry[input.name] === false);
                    break;
            }
        }
        
        // save output into this._filteredData
        // so updateForm() doesn't need to filterData() again
        this._filteredData = fData;
    }

    updateForm() {
        // update form input values to reflect chosen filters
        // for select inputs: only unchosen filters will update
        // this ended up being kinda dumb sometimes

        for (let k in this._inputs) {
            const input = this._inputs[k];
            let fVals = new Set();
            for (let entry of this._filteredData) fVals.add(entry[input.name]);
            fVals.delete("");

            switch (input.type) {
                case "select":
                    // replace options
                    if (input.element.value && input.element.value !== "*") continue;
                    input.element.innerHTML = "";
                    fVals = [...fVals].sort();

                    const optAny = newE("option");
                    optAny.value = "*";
                    optAny.textContent = "Any";
                    input.element.appendChild(optAny);
                    for (let val of fVals) {
                        const opt = newE("option");
                        opt.value = val;
                        opt.textContent = val;
                        input.element.appendChild(opt);
                    }
                    break;

                case "range":
                    // set handle positions
                    fVals = [...fVals].sort((a, b) => a - b);
                    const minVal = fVals[0];
                    const maxVal = fVals[fVals.length - 1];
                    const minPos = input.element.data.indexOf(minVal);
                    const maxPos = input.element.data.indexOf(maxVal);
                    input.element.moveHandlesToPos(minPos, maxPos);
                    break;
            }
        }
    }

    getFilteredData() {
        return this._filteredData;
    }

    resetForm() {
        // duct tape + bandaids
        this._filteredData = JSON.parse(JSON.stringify(this._data));
        for (let k in this._inputs) {
            const input = this._inputs[k];
            
            if (input.requires) {
                input.element.disabled = true;
            }
            
            if (input.type === "select") {
                input.element.value = "*";
            } else if (input.type === "togglebox") {
                input.element.state = "none";
            }
        }
        this._changeFunc(false);
    }
}
