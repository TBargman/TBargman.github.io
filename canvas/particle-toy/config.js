const frictionLabel = document.querySelector("#inputFrictionCheck + label");

export const Config = {
    selectedColors: "ocean",
    blendMode: "source-over",
    emitterSize: 1,
    particleSize: 2,
    spawnDelay: 0.25,
    minLife: 100,
    maxLife: 1000,
    minSpeed: 0,
    maxSpeed: 3,
    gravity: 0.04,
    friction: 1.015,
    pushForce: 0.5,
    magnet: 0,
    fadeEffectAlpha: 0.3,
    blur: 4,
    gravityEnabled: true,
    frictionEnabled: true,
    pushEnabled: true,
    magnetEnabled: false,
    wallsEnabled: false,
    fadeEffect: true,
    blurEnabled: false,
    applyPreset: function(preset) {
        for (let prop in Presets[preset]) this[prop] = Presets[preset][prop];
        
        // update menu
        Menu.presetInput.value = preset;
        for (let propName in Menu.inputs) {
            
            const input = Menu.inputs[propName];
            let val = Config[propName];
            if ("getValue" in input) val = input.getValue();
            input.element.value = val;
            if ("checked" in input.element) input.element.checked = val;
            
            if (input.display) {
                if ("unit" in input) val += input.unit;
                input.display.textContent = val;
            }
        }
        Menu.performance.maxParticles.textContent = `${Menu.performance.getMaxParticles()} (approx.)`;
    },
    useCustom: function() {
        Menu.presetInput.value = "custom";
        for (let propName in Presets.custom) {
            Presets.custom[propName] = Config[propName];
        }
    }
};

// setValue() converts the displayed value and
// sets the Config key and/or do other things.
// getValue() converts the Config value and returns
// what will be shown in the display element.
export const Menu = {
    presetInput: document.querySelector("#inputPreset"),
    inputs: {
        selectedColors: {
            type: "select",
            element: document.querySelector("#inputColors")
        },
        blendMode: {
            type: "select",
            element: document.querySelector("#inputBlendMode")
        },
        emitterSize: {
            type: "range",
            element: document.querySelector("#inputEmitterSize"),
            display: document.querySelector("#valueEmitterSize"),
            unit: "px"
        },
        particleSize: {
            type: "range",
            element: document.querySelector("#inputSize"),
            display: document.querySelector("#valueSize"),
            unit: "px"
        },
        spawnDelay: {
            type: "range",
            element: document.querySelector("#inputPPS"),
            display: document.querySelector("#valuePPS"),
            setValue: (val) => {Config.spawnDelay = 1000 / val},
            getValue: () => Math.round(1 / Config.spawnDelay * 1000)
        },
        minSpeed: {
            type: "range",
            element: document.querySelector("#inputMinSpeed"),
            display: document.querySelector("#valueMinSpeed")
        },
        maxSpeed: {
            type: "range",
            element: document.querySelector("#inputMaxSpeed"),
            display: document.querySelector("#valueMaxSpeed")
        },
        minLife: {
            type: "range",
            element: document.querySelector("#inputMinLife"),
            display: document.querySelector("#valueMinLife"),
            unit: " sec",
            setValue: (val) => {Config.minLife = val * 1000},
            getValue: () => Config.minLife * 0.001
        },
        maxLife: {
            type: "range",
            element: document.querySelector("#inputMaxLife"),
            display: document.querySelector("#valueMaxLife"),
            unit: " sec",
            setValue: (val) => {
                if (val > 10) Config.maxLife = -1;
                else Config.maxLife = val * 1000;
            },
            getValue: () => {
                if (Config.maxLife < 0) return "Infinite";
                return Config.maxLife * 0.001;
            }
        },
        gravity: {
            type: "range",
            element: document.querySelector("#inputGravity"),
            display: document.querySelector("#valueGravity"),
            setValue: (val) => {
                Config.gravity = val;
                if (val === 0) frictionLabel.textContent = "X/Y Friction";
                else frictionLabel.textContent = "X Friction";
            }
        },
        friction: {
            type: "range",
            element: document.querySelector("#inputFriction"),
            display: document.querySelector("#valueFriction"),
            setValue: (val) => {Config.friction = val + 1},
            getValue: () => parseFloat((Config.friction - 1).toFixed(3))
        },
        pushForce: {
            type: "range",
            element: document.querySelector("#inputPush"),
            display: document.querySelector("#valuePush")
        },
        fadeEffectAlpha: {
            type: "range",
            element: document.querySelector("#inputFade"),
            display: document.querySelector("#valueFade"),
            unit: "%",
            setValue: (val) => {Config.fadeEffectAlpha = -0.01 * (val - 100)},
            getValue: () => -100 * (Config.fadeEffectAlpha - 1)
        },
        blur: {
            type: "range",
            element: document.querySelector("#inputBlur"),
            display: document.querySelector("#valueBlur"),
            unit: "px"
        },
        gravityEnabled: {
            type: "checkbox",
            element: document.querySelector("#inputGravityCheck"),
            setValue: (val) => {
                Config.gravityEnabled = val;
                if (val) frictionLabel.textContent = "X friction";
                else frictionLabel.textContent = "X/Y friction";
            }
        },
        frictionEnabled: {
            type: "checkbox",
            element: document.querySelector("#inputFrictionCheck")
        },
        pushEnabled: {
            type: "checkbox",
            element: document.querySelector("#inputPushCheck")
        },
        fadeEffect: {
            type: "checkbox",
            element: document.querySelector("#inputFadeCheck")
        },
        blurEnabled: {
            type: "checkbox",
            element: document.querySelector("#inputBlurCheck")
        }
    },
    performance: {
        maxParticles: document.querySelector("#maxParticlesCalc"),
        particleCount: document.querySelector("#particleCount"),
        getMaxParticles: function() {
            let avg;
            if (Config.minLife > Config.maxLife) avg = Config.minLife;
            else avg = (Config.maxLife + Config.minLife) / 2;
            return Math.round((avg * 0.001) * (1000 / Config.spawnDelay));
        }
    }
};

export const ColorSchemes = {
    "ocean": [
        "135,225,255",
        "174,193,255",
        "51,141,255",
        "5,255,185",
        "0,198,253"],
    "autumn": [
        "207,105,0",
        "255,156,51",
        "255,58,21",
        "255,97,138",
        "254,211,89",
        "254,128,89"],
    "fire": [
        "255,52,21",
        "107,34,9",
        "221,64,0",
        "254,110,0",
        "255,146,21"],
    "emerald": [
        "0,158,74",
        "112,255,112",
        "175,255,64",
        "0,254,93",
        "30,221,0"],
    "sapphire": [
        "47,104,240",
        "12,13,165",
        "94,138,208",
        "8,8,109",
        "0,46,121"],
    "idk": [
        "52,63,86",
        "245,71,72",
        "251,147,0",
        "245,230,202"],
    "idk2": [
        "0,168,204",
        "0,80,130",
        "0,8,57",
        "255,164,27"],
    "sunset": [
        "106,44,112",
        "184,59,94",
        "240,138,93",
        "249,237,105"],
    "smoke": [
        "73,77,91",
        "94,92,115",
        "113,106,128",
        "150,148,172",
        "168,155,177"]
};

const Presets = {
    default: {
        selectedColors: "ocean",
        blendMode: "source-over",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.25,
        minLife: 100,
        maxLife: 1000,
        minSpeed: 0,
        maxSpeed: 3,
        gravity: 0.04,
        friction: 1.015,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.3,
        blur: 4,
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: false
    },
    flame: {
        selectedColors: "fire",
        blendMode: "lighter",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.16667,
        minLife: 100,
        maxLife: 800,
        minSpeed: 0,
        maxSpeed: 1.5,
        gravity: -0.15,
        friction: 1.06,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.25,
        blur: 1,
        gravityEnabled: true,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: true
    },
    incantation: {
        selectedColors: "sapphire",
        blendMode: "lighter",
        emitterSize: 25,
        particleSize: 1,
        spawnDelay: 0.25,
        minLife: 100,
        maxLife: 6000,
        minSpeed: 0.2,
        maxSpeed: 0.5,
        gravity: -0.15,
        friction: 1.06,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.1,
        blur: 8,
        gravityEnabled: false,
        frictionEnabled: false,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: true
    },
    coral: {
        selectedColors: "autumn",
        blendMode: "source-over",
        emitterSize: 1,
        particleSize: 4,
        spawnDelay: 0.4,
        minLife: 100,
        maxLife: 3200,
        minSpeed: 0,
        maxSpeed: 0.4,
        gravity: -0.03,
        friction: 1.04,
        magnet: 0,
        pushForce: 0.5,
        fadeEffectAlpha: 0.07,
        blur: 4,
        gravityEnabled: true,
        frictionEnabled: false,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: false
    },
    ink: {
        selectedColors: "ocean",
        blendMode: "source-over",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.125,
        minLife: 1500,
        maxLife: 3000,
        minSpeed: 0,
        maxSpeed: 10,
        gravity: -0.03,
        friction: 1.6,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.4,
        blur: 4,
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: false,
        blurEnabled: false
    },
    rings: {
        selectedColors: "ocean",
        blendMode: "source-over",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.06667,
        minLife: 100,
        maxLife: 300,
        minSpeed: 10,
        maxSpeed: 10,
        gravity: 0.04,
        friction: 1.25,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.3,
        blur: 4,
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: false,
        blurEnabled: false
    },
    steam: {
        selectedColors: "smoke",
        blendMode: "screen",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.55556,
        minLife: 1500,
        maxLife: 3000,
        minSpeed: 2,
        maxSpeed: 4,
        gravity: 0.04,
        friction: 1.25,
        pushForce: -0.75,
        magnet: 0,
        fadeEffectAlpha: 0.1,
        blur: 12,
        gravityEnabled: false,
        frictionEnabled: false,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: true
    },
    custom: {
        selectedColors: "ocean",
        blendMode: "source-over",
        emitterSize: 1,
        particleSize: 2,
        spawnDelay: 0.25,
        minLife: 100,
        maxLife: 1000,
        minSpeed: 0,
        maxSpeed: 3,
        gravity: 0.04,
        friction: 1.015,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.3,
        blur: 4,
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true,
        blurEnabled: false
    }
};