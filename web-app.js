"use strict";

// Keep rapid battlefield taps from becoming Safari zoom gestures.
document.addEventListener("dblclick",event=>event.preventDefault(),{passive:false});
for(const eventName of ["gesturestart","gesturechange","gestureend"]){
  document.addEventListener(eventName,event=>event.preventDefault(),{passive:false});
}

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./service-worker.js").catch(error=>{
    console.warn("Offline mode could not be enabled.",error);
  });
}
