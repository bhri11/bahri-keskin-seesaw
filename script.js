const playground = document.getElementById("playground");
const seesaw = document.getElementById("seesaw");

playground.addEventListener("click", (event) => {
    const rect = playground.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const seesawRect = seesaw.getBoundingClientRect();
    const seesawLeft = seesawRect.left - rect.left;
    const seesawRight = seesawLeft + seesawRect.width;

    console.log("Click X Position:", clickX);
    console.log("seesawLeft:", seesawLeft, "seesawRight:", seesawRight);

    if (clickX < seesawLeft || clickX > seesawRight) {
        console.log("Click outside seesaw area. Ignored.");
        return;
    }
    console.log("Click is inside seesaw range.")
});


