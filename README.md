A mod to let you use your mouse with pressure sensitivity automatically based on the speed of the mouse

Written in javascript, compatible with typo (don't use with Modified Pen Pressure)

#### usage (bookmarklet method)

Triple click this and drag it into your bookmarks bar

```
javascript:(() => {class PreviousEvent{constructor(){this.x=0,this.y=0,this.t=0}update(e){let t=performance.now(),i=Math.sqrt(Math.pow(this.x-e.x,2)+Math.pow(this.y-e.y,2)),n=t-this.t;return this.x=e.x,this.y=e.y,this.t=t,i/n}}class SpeedAsPressureMod{constructor(){this.canvas=document.querySelector("#game-canvas canvas"),this.oldPointerCapture=this.canvas.setPointerCapture,this.canvas.setPointerCapture=()=>"intercepted";let e=this.canvas.getBoundingClientRect();this.clickAreaElement=document.createElement("div"),this.clickAreaElement.style.position="fixed",this.clickAreaElement.style.top=`${e.top}px`,this.clickAreaElement.style.height=`${e.height}px`,this.clickAreaElement.style.left=`${e.left}px`,this.clickAreaElement.style.width=`${e.width}px`,this.addClickAreaHandlers(),this.turnOnPressureSensitivity(),document.body.append(this.clickAreaElement),this.createGUI()}turnOnPressureSensitivity(){let e=document.getElementById("select-pressure-sensitivity");this.oldSensitivitySetting=e.value,e.value="1",e.dispatchEvent(new Event("change",{}))}createGUI(){let e=document.createElement("div");e.style="position:fixed;top:0;right:0;width:100px;background-color:gray;color:black;border:1px solid white;padding:8px;",e.innerHTML="<strong>speed as pressure mod</strong>";let t=document.createElement("button");t.innerText="DISABLE",t.style="background-color:black;color: white",t.onclick=()=>{this.destroy(),e.remove()},e.append(t),document.body.append(e)}sendPointerEvent(e,t,i){let n=new PointerEvent(e,{altKey:t.altKey,altitudeAngle:t.altitudeAngle,azimuthAngle:t.azimuthAngle,bubbles:t.bubbles,button:t.button,buttons:t.buttons,cancelBubble:t.cancelBubble,cancelable:t.cancelable,clientX:t.clientX,clientY:t.clientY,composed:t.composed,ctrlKey:t.ctrlKey,currentTarget:t.currentTarget,defaultPrevented:t.defaultPrevented,detail:t.detail,eventPhase:t.eventPhase,fromElement:t.fromElement,height:t.height,isPrimary:t.isPrimary,layerX:t.layerX,layerY:t.layerY,metaKey:t.metaKey,movementX:t.movementX,movementY:t.movementY,offsetX:t.offsetX,offsetY:t.offsetY,pageX:t.pageX,pageY:t.pageY,persistentDeviceId:t.persistentDeviceId,pointerId:t.pointerId,pointerType:t.pointerType,pressure:t.pressure,pseudoTarget:t.pseudoTarget,relatedTarget:t.relatedTarget,returnValue:t.returnValue,screenX:t.screenX,screenY:t.screenY,shiftKey:t.shiftKey,sourceCapabilities:t.sourceCapabilities,srcElement:t.srcElement,tangentialPressure:t.tangentialPressure,target:t.target,tiltX:t.tiltX,tiltY:t.tiltY,timeStamp:t.timeStamp,toElement:t.toElement,twist:t.twist,type:t.type,view:t.view,which:t.which,width:t.width,x:t.x,y:t.y,...i,bubbles:!0,cancelable:!0,isPrimary:!0,pointerType:"pen"});return this.canvas.dispatchEvent(n),n}addClickAreaHandlers(){let e=new PreviousEvent;this.clickAreaElement.onpointerdown=t=>{this.clickAreaElement.setPointerCapture(t.pointerId),e.update(t),this.sendPointerEvent("pointerdown",t,{pressure:0})},this.clickAreaElement.onpointermove=t=>{let i=e.update(t);this.sendPointerEvent("pointermove",t,{...t,pressure:i})},this.clickAreaElement.onpointerup=e=>{this.clickAreaElement.releasePointerCapture(e.pointerId),this.sendPointerEvent("pointerup",e,{...e,pressure:0})}}destroy(){this.clickAreaElement.remove(),this.canvas.setPointerCapture=this.oldPointerCapture;let e=document.getElementById("select-pressure-sensitivity");e.value=this.oldSensitivitySetting,e.dispatchEvent(new Event("change",{}))}}; new SpeedAsPressureMod() })()
```

If your browser doesn't let you do that:
- Triple click the code and copy it
- Bookmark this page
- Right click the new bookmark in the bookmarks bar
- Press Edit
- In URL, delete whatever's there and paste in the new text
- Click Save

---

Once you've finished setting up the bookmark, go to skribbl and just click it. You'll know it works if a small menu shows up in the top right corner. Press `DISABLE` to turn it off
