const frictionLabel = document.querySelector("#inputFrictionCheck + label");

export const Config = {
    presetName: "default",
    usingPreset: true,
    selectedColors: "ocean",
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
    gravityEnabled: true,
    frictionEnabled: true,
    pushEnabled: true,
    magnetEnabled: false,
    wallsEnabled: false,
    fadeEffect: true,
    applyPreset: function(preset) {
        Config.presetName = preset;
        Config.usingPreset = true;
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
    },
    setCustom: function() {
        this.usingPreset = false;
        Menu.presetInput.value = "custom";
        for (let propName in Presets.custom) {
            Presets.custom[propName] = Config[propName];
        }
    }
};

export const Menu = {
    presetInput: document.querySelector("#inputPreset"),
    inputs: {
        selectedColors: {
            type: "select",
            element: document.querySelector("#inputColors"),
            setValue: (val) => {Config.selectedColors = val}
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
                if (val === 10.1) Config.maxLife = -1;
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
        wallsEnabled: {
            type: "checkbox",
            element: document.querySelector("#inputWallsCheck")
        },
        fadeEffect: {
            type: "checkbox",
            element: document.querySelector("#inputFadeCheck")
        }
    },
    performance: {
        maxParticles: document.querySelector("#maxParticlesCalc"),
        particleCount: document.querySelector("#particleCount")
    }
};

export const ColorSchemes = {
    "ocean": [
        "#87E1FF",
        "#AEC1FF",
        "#338DFF",
        "#05FFB9",
        "#00C6FD"],
    "autumn": [
        "#CF6900",
        "#FF9C33",
        "#FF3A15",
        "#FF618A",
        "#FED359",
        "#FE8059"],
    "fire": [
        "#FF3415",
        "#6B2209",
        "#DD4000",
        "#FE6E00",
        "#FF9215"],
    "emerald": [
        "#009E4A",
        "#70FF70",
        "#AFFF40",
        "#00FE5D",
        "#1EDD00"],
    "sapphire": [
        "#2F68F0",
        "#0C0DA5",
        "#5E8AD0",
        "#08086D",
        "#002E79"],
    "idk": [
        "#343F56",
        "#F54748",
        "#FB9300",
        "#F5E6CA"],
    "idk2": [
        "#6A2C70",
        "#B83B5E",
        "#F08A5D",
        "#F9ED69"],
    "idk3": [
        "#00A8CC",
        "#005082",
        "#000839",
        "#FFA41B"],
    "smoke": [
        "#494D5B",
        "#5E5C73",
        "#716A80",
        "#9694AC",
        "#A89BB1"]
};

const Presets = {
    default: {
        selectedColors: "ocean",
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
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true
    },
    flame: {
        selectedColors: "fire",
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
        fadeEffectAlpha: 0.3,
        gravityEnabled: true,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true
    },
    coral: {
        selectedColors: "autumn",
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
        gravityEnabled: true,
        frictionEnabled: false,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true
    },
    ink: {
        selectedColors: "ocean",
        particleSize: 2,
        spawnDelay: 0.125,
        minLife: 1500,
        maxLife: 3000,
        minSpeed: 0,
        maxSpeed: 10,
        gravity: -0.03,
        friction: 2,
        pushForce: 0.5,
        magnet: 0,
        fadeEffectAlpha: 0.4,
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: false
    },
    rings: {
        selectedColors: "ocean",
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
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: false,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: false
    },
    custom: {
        selectedColors: "ocean",
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
        gravityEnabled: false,
        frictionEnabled: true,
        pushEnabled: true,
        magnetEnabled: false,
        wallsEnabled: false,
        fadeEffect: true
    }
};