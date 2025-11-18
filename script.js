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
const seesawGroup = document.getElementById("seesaw-group");

const leftWeightElement = document.getElementById("left-weight-value");
const rightWeightElement = document.getElementById("right-weight-value");
const nextWeightElement = document.getElementById("next-weight-value");
const tiltAngleElement = document.getElementById("tilt-angle-value");

let nextWeight = 0;

function generateNextWeight() {
  nextWeight = Math.floor(Math.random() * 10) + 1;
  nextWeightElement.textContent = `${nextWeight} kg`;
}

generateNextWeight();

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

    const weightValue =  nextWeight;
    ball.textContent = weightValue + "kg";

    const randomIndex = Math.floor(Math.random() * COLORS.length);
    const randomColor = COLORS[randomIndex];
    ball.style.backgroundColor = randomColor;

    const size = 20 + weightValue * 4;
    ball.style.width = size + "px";
    ball.style.height = size + "px";

    const startY = size / 2 + 5;
    ball.style.left = clickX + "px";
    ball.style.top  = startY + "px";
    ball.style.opacity = "0.3";
    
    playground.appendChild(ball);

    requestAnimationFrame(() => {
        ball.style.top = seesawCenterY + "px";  
        ball.style.opacity = "1";
    });

    const pivotX = (seesawLeft + seesawRight) / 2;

    let side;
    if (clickX < pivotX) {
        side = "left";
    } else if (clickX > pivotX) {
        side = "right";
    } else {
        side = "center"; 
    }

    const distance = Math.abs(clickX - pivotX);
    const weightData = { 
        weight: weightValue,
        side,
        distance 
    };

    const onTransitionEnd = (e) => {
        if (e.propertyName !== "top") return;
        ball.removeEventListener("transitionend", onTransitionEnd);

        const currentLeft = ball.style.left;
        const currentTop = ball.style.top;

        seesawGroup.appendChild(ball);
        ball.style.left = currentLeft;
        ball.style.top = currentTop;

        weights.push(weightData);
        calculateTorques();
        generateNextWeight();
    };

    ball.addEventListener("transitionend", onTransitionEnd);
    
    console.log("side:", side, "distance:", distance);

    
});

function calculateTorques() {
    let leftTorque = 0;
    let rightTorque = 0;

    let leftWeightSum = 0;
    let rightWeightSum = 0;

    for (const w of weights) {
        const torque = w.weight * w.distance;

        if (w.side === "left") {
            leftTorque += torque;
            leftWeightSum += w.weight;
        } else if (w.side === "right") {
            rightTorque += torque;
            rightWeightSum += w.weight; 
        }
    }

    console.log("Left Torque:", leftTorque, "Right Torque:", rightTorque);

    const netTorque = rightTorque - leftTorque;
    console.log("Net Torque:", netTorque);

    const angle = Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10));

    seesawGroup.style.transform = `rotate(${angle}deg)`;
    leftWeightElement.textContent = `${leftWeightSum.toFixed(1)} kg`;
    rightWeightElement.textContent = `${rightWeightSum.toFixed(1)} kg`;
    tiltAngleElement.textContent = `${angle.toFixed(1)}°`;

    console.log(
    "Left Torque:", leftTorque,
    "Right Torque:", rightTorque,
    "Net:", netTorque,
    "Angle:", angle
  );

}


