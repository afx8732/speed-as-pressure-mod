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

        this.canvas.parentElement.appendChild(this.clickAreaElement);

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
        const guiElement = document.createElement("div");
        guiElement.style = "position:fixed;top:0;left:64px;width:48px;height:48px;background-color:gray;color:black;border:1px solid white;padding:8px;border-radius:48px;background-image: url(\"/img/pen.gif\");scale:80%;color:white;font-size:12px;cursor:pointer";
        guiElement.innerText = "SAP mod";
        guiElement.title = "click to disable";

        guiElement.onclick = () => {
            this.destroy();
            guiElement.remove();
        };

        document.body.append(guiElement);
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
    }
}
