class PreviousEvent {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.t = 0;
    }

    update(event) {
        const now = performance.now();

        const distance = Math.sqrt(
            Math.pow(this.x - event.x, 2) + Math.pow(this.y - event.y, 2),
        );
        const time = now - this.t;

        this.x = event.x;
        this.y = event.y;
        this.t = now;

        return distance / time;
    }
}

// i love needless abstraction!!!
class PersistentCoordinates {
    #x; #y;

    constructor() {
        this.#x = localStorage.getItem("sap-mod-gui-x") || x;
        this.#y = localStorage.getItem("sap-mod-gui-y") || y;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    set x(newX) {
        this.#x = newX;
        this.#save();
    }

    set y(newY) {
        this.#y = newY;
        this.#save();
    }

    #save() {
        localStorage.setItem(`sap-mod-gui-x`, this.#x);
        localStorage.setItem(`sap-mod-gui-y`, this.#y);
    }
}

function smoothVelocity(v) {
    const r = 2;
    const v0 = 0.75;
    return 1 / ( 1 + Math.pow(Math.E, -r*(v-v0)) )
}

class SpeedAsPressureMod {
    constructor() {
        this.canvas = document.querySelector("#game-canvas canvas");

        this.oldPointerCapture = this.canvas.setPointerCapture;
        this.canvas.setPointerCapture = () => "intercepted";

        this.clickAreaElement = this.canvas.cloneNode(true);
        this.clickAreaElement.style.zIndex = "0";
        this.addClickAreaHandlers();
        this.canvas.style.position = "absolute";

        this.canvas.after(this.clickAreaElement);

        this.turnOnPressureSensitivity();
        this.createGUI();
    }

    turnOnPressureSensitivity() {
        const element = document.getElementById("select-pressure-sensitivity");
        this.oldSensitivitySetting = element.value;
        element.value = "1";
        element.dispatchEvent(new Event("change", {}));
    }

    createGUI() {
        const position = new PersistentCoordinates();

        this.guiElement = document.createElement("div");
        this.guiElement.style = `position:fixed;width:48px;height:48px;background-color:gray;color:black;border:1px solid white;padding:8px;border-radius:48px;background-image: url(\"/img/pen.gif\");scale:80%;color:white;font-size:12px;cursor:pointer`;
        this.guiElement.innerText = "SAP mod";
        this.guiElement.title = "click to disable";

        const updateGuiAbsolutePosition = () => {
            this.guiElement.style.top = `${position.y - 24}px`;
            this.guiElement.style.left = `${position.x - 24}px`;
        }
        updateGuiAbsolutePosition();

        let isDragging = false;
        // if false then destroy because its clicked
        let didMoveDuringDrag = false;

        this.guiElement.onpointerdown = (e) => {
            isDragging = true;
            this.guiElement.setPointerCapture(e.pointerId);
        };
        // these should be on window but its annoying to clean up in this.destroy so screw it
        this.guiElement.addEventListener("pointerup", (e) => {
            if (isDragging) {
                isDragging = false;
                this.guiElement.releasePointerCapture(e.pointerId);
            }

            if (!didMoveDuringDrag) {
                this.destroy();
            }

            didMoveDuringDrag = false;
        });
        this.guiElement.addEventListener("pointermove", (e) => {
            if (!isDragging) return;
            didMoveDuringDrag = true;
            position.x = e.pageX;
            position.y = e.pageY;
            updateGuiAbsolutePosition();
        });

        document.body.append(this.guiElement);
    }

    sendPointerEvent(name, original, detail) {
        const evt = new PointerEvent(name, {
            altKey: original.altKey,
            altitudeAngle: original.altitudeAngle,
            azimuthAngle: original.azimuthAngle,
            bubbles: original.bubbles,
            button: original.button,
            buttons: original.buttons,
            cancelBubble: original.cancelBubble,
            cancelable: original.cancelable,
            clientX: original.clientX,
            clientY: original.clientY,
            composed: original.composed,
            ctrlKey: original.ctrlKey,
            currentTarget: original.currentTarget,
            defaultPrevented: original.defaultPrevented,
            detail: original.detail,
            eventPhase: original.eventPhase,
            fromElement: original.fromElement,
            height: original.height,
            isPrimary: original.isPrimary,
            layerX: original.layerX,
            layerY: original.layerY,
            metaKey: original.metaKey,
            movementX: original.movementX,
            movementY: original.movementY,
            offsetX: original.offsetX,
            offsetY: original.offsetY,
            pageX: original.pageX,
            pageY: original.pageY,
            persistentDeviceId: original.persistentDeviceId,
            pointerId: original.pointerId,
            pointerType: original.pointerType,
            pressure: original.pressure,
            pseudoTarget: original.pseudoTarget,
            relatedTarget: original.relatedTarget,
            returnValue: original.returnValue,
            screenX: original.screenX,
            screenY: original.screenY,
            shiftKey: original.shiftKey,
            sourceCapabilities: original.sourceCapabilities,
            srcElement: original.srcElement,
            tangentialPressure: original.tangentialPressure,
            target: original.target,
            tiltX: original.tiltX,
            tiltY: original.tiltY,
            timeStamp: original.timeStamp,
            toElement: original.toElement,
            twist: original.twist,
            type: original.type,
            view: original.view,
            which: original.which,
            width: original.width,
            x: original.x,
            y: original.y,

            ...detail,
            bubbles: true,
            cancelable: true,
            isPrimary: true,
            pointerType: "pen",
        });

        this.canvas.dispatchEvent(evt);
        return evt;
    }

    addClickAreaHandlers() {
        let previous = new PreviousEvent();

        this.clickAreaElement.onpointerdown = (e) => {
            this.clickAreaElement.setPointerCapture(e.pointerId);
            previous.update(e);
            this.sendPointerEvent("pointerdown", e, {
                pressure: 0,
            });
        };

        this.clickAreaElement.onpointermove = (e) => {
            const velocity = previous.update(e);
            const smoothed = smoothVelocity(velocity);
            
            this.sendPointerEvent("pointermove", e, {
                ...e,
                pressure: smoothed,
            });
        };

        this.clickAreaElement.onpointerup = (e) => {
            this.clickAreaElement.releasePointerCapture(e.pointerId);
            this.sendPointerEvent("pointerup", e, {
                ...e,
                pressure: 0,
            });
        };
    }

    destroy() {
        this.clickAreaElement.remove();
        this.canvas.setPointerCapture = this.oldPointerCapture;
        this.canvas.style.position = "initial";

        const setting = document.getElementById("select-pressure-sensitivity");
        setting.value = this.oldSensitivitySetting;
        setting.dispatchEvent(new Event("change", {}));
        this.guiElement.remove();
    }
}
