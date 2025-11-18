const COLORS = [
  "#ff6b6b", 
  "#feca57", 
  "#ff9ff3", 
  "#1dd1a1", 
  "#54a0ff", 
  "#5f27cd", 
  "#576574", 
  "#2ecc71", 
  "#e67e22", 
  "#e84393"  
];
const weights = [];


const playground = document.getElementById("playground");
const seesaw = document.getElementById("seesaw");

playground.addEventListener("click", (event) => {
    const rect = playground.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const seesawRect = seesaw.getBoundingClientRect();
    const seesawLeft = seesawRect.left - rect.left;
    const seesawRight = seesawLeft + seesawRect.width;

    const seesawCenterY = (seesawRect.top - rect.top) + seesawRect.height / 2;

    console.log("Click X Position:", clickX);
    console.log("seesawLeft:", seesawLeft, "seesawRight:", seesawRight);

    if (clickX < seesawLeft || clickX > seesawRight) {
        console.log("Click outside seesaw area. Ignored.");
        return;
    }
    console.log("Click is inside seesaw range.")

    const ball = document.createElement("div");
    ball.classList.add("weight-object");

    const weightValue = Math.floor(Math.random() * 10) + 1;
    ball.textContent = weightValue;

    const randomIndex = Math.floor(Math.random() * COLORS.length);
    const randomColor = COLORS[randomIndex];
    ball.style.backgroundColor = randomColor;

    const size = 20 + weightValue * 4;
    ball.style.width = size + "px";
    ball.style.height = size + "px";

    playground.appendChild(ball);
    ball.style.left = clickX + "px";
    ball.style.top = seesawCenterY + "px"; 

    const pivotX = (seesawLeft + seesawRight) / 2;

    let side;
    if (clickX < pivotX) {
        side = "left";
    } else if (clickX > pivotX) {
        side = "right";
    } else {
        side = "center"; // tam ortaya tıklandıysa, şimdilik özel durum
    }

    const distance = Math.abs(clickX - pivotX);
    console.log("side:", side, "distance:", distance);

    weights.push({
        weight: weightValue,
        side: side,
        distance: distance
    });
    console.log(weights);

    calculateTorques();

});

function calculateTorques() {
    let leftTorque = 0;
    let rightTorque = 0;

    for (const w of weights) {
        const torque = w.weight * w.distance;

        if (w.side === "left") {
            leftTorque += torque;
        } else if (w.side === "right") {
            rightTorque += torque;
        }
    }

    console.log("Left Torque:", leftTorque, "Right Torque:", rightTorque);

    const netTorque = rightTorque - leftTorque;
    console.log("Net Torque:", netTorque);

    const angle = Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10));

    seesaw.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}


