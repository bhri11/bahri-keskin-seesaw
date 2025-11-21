// Color palette for weight circles
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
// list of all dropped weights
const weights = [];

// Main DOM references
const playground = document.getElementById("playground");
const seesaw = document.getElementById("seesaw");
const seesawGroup = document.getElementById("seesaw-group");
const resetButton = document.getElementById("reset-button");

const leftWeightElement = document.getElementById("left-weight-value");
const rightWeightElement = document.getElementById("right-weight-value");
const nextWeightElement = document.getElementById("next-weight-value");
const tiltAngleElement = document.getElementById("tilt-angle-value");

// Preview UI for the next weight
const preview = document.getElementById("weight-preview");
const previewCircle = document.getElementById("weight-preview-circle");

// Horizontal distance helper from pivot
const pivotDistance = document.getElementById("pivot-distance");
const pivotDistanceLine = document.getElementById("pivot-distance-line");
const pivotDistanceLabel = document.getElementById("pivot-distance-label");

// Drop log panel at the bottom
const dropLog = document.getElementById("drop-log");

// Simple drop sound for feedback
const dropSound = new Audio("sounds/pop-cartoon.mp3");
//const dropSound = new Audio("sounds/ball-dropping-on-bench.mp3");
dropSound.volume = 0.7; 

let nextWeight = 0;

/**
 * Generates the next random weight (1–10 kg) and updates the UI.
 * Also updates the preview bubble so the user sees what will be dropped.
 */
function generateNextWeight() {
  nextWeight = Math.floor(Math.random() * 10) + 1;
  nextWeightElement.textContent = `${nextWeight} kg`;
  if (previewCircle) {
    previewCircle.textContent = nextWeight + "kg";
  }
}

// Try to restore from localStorage when the page loads
loadState();

/**
 * Mouse move handler over the playground.
 * Shows a vertical preview line and the pivot distance
 * only when the cursor is over the seesaw.
 */
playground.addEventListener("mousemove", (event) => {
    const rect = playground.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const seesawRect = seesaw.getBoundingClientRect();
    const seesawLeft = seesawRect.left - rect.left;
    const seesawRight = seesawLeft + seesawRect.width;
    const seesawCenterY = (seesawRect.top - rect.top) + seesawRect.height / 2;
    const pivotX = (seesawLeft + seesawRight) /2;

     // Hide preview if mouse is outside the seesaw bar
    if (mouseX  < seesawLeft || mouseX > seesawRight) {
        preview.style.display = "none";
        pivotDistance.style.display = "none";
        return;
    }

    // Update preview bubble position
    preview.style.display = "block";
    previewCircle.textContent = nextWeight + "kg";
    preview.style.left = mouseX + "px";
    preview.style.top = seesawCenterY + "px";

    // Update pivot distance helper
    const distance = Math.abs(mouseX - pivotX);

    pivotDistance.style.display = "block";
    const lineleft = Math.min(mouseX, pivotX);
    pivotDistance.style.left = lineleft + "px";
    pivotDistance.style.top = (seesawCenterY -25) + "px";

    pivotDistanceLine.style.width = distance + "px";
    pivotDistanceLabel.textContent = `${Math.round(distance)} px`;
});

// When the mouse leaves the playground, hide helpers
playground.addEventListener("mouseleave", () =>{
    preview.style.display = "none";
    pivotDistance.style.display = "none";
});

/**
 * Click handler for dropping a new weight.
 * Validates click area, animates the ball falling,
 * updates internal state, log, torque and saves to localStorage.
 */
playground.addEventListener("click", (event) => {
    const rect = playground.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const seesawRect = seesaw.getBoundingClientRect();
    const seesawLeft = seesawRect.left - rect.left;
    const seesawRight = seesawLeft + seesawRect.width;
    const seesawCenterY = (seesawRect.top - rect.top) + seesawRect.height / 2;

    //console.log("Click X Position:", clickX);
    //console.log("seesawLeft:", seesawLeft, "seesawRight:", seesawRight);

    // Ignore clicks outside of the seesaw area
    if (clickX < seesawLeft || clickX > seesawRight) {
        console.log("Click outside seesaw area. Ignored.");
        return;
    }
    console.log("Click is inside seesaw range.")

    // Create the weight element (ball)
    const ball = document.createElement("div");
    ball.classList.add("weight-object");

    const weightValue =  nextWeight;
    ball.textContent = weightValue + "kg";

     // Pick a random color for this weight
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    const randomColor = COLORS[randomIndex];
    ball.style.backgroundColor = randomColor;

    // Slightly scale the ball size with weight
    const size = 20 + weightValue * 4;
    ball.style.width = size + "px";
    ball.style.height = size + "px";

    // Start position: above the seesaw, semi-transparent
    const startY = size / 2 + 5;
    ball.style.left = clickX + "px";
    ball.style.top  = startY + "px";
    ball.style.opacity = "0.3";
    
    playground.appendChild(ball);

    // Trigger CSS transition for the falling animation
    requestAnimationFrame(() => {
        ball.style.top = seesawCenterY + "px";  
        ball.style.opacity = "1";
    });

    const pivotX = (seesawLeft + seesawRight) / 2;

    // Determine which side of the pivot this weight belongs to
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
        distance,
        color: randomColor  
    };

     // After the falling animation ends, we finalize state and play sound
    const onTransitionEnd = (e) => {
        if (e.propertyName !== "top") return;
        ball.removeEventListener("transitionend", onTransitionEnd);

        // Play drop sound every time a ball lands
        dropSound.currentTime = 0;
        dropSound.play();

        // Move ball into the rotating group so it follows the seesaw tilt
        const currentLeft = ball.style.left;
        const currentTop = ball.style.top;

        seesawGroup.appendChild(ball);
        ball.style.left = currentLeft;
        ball.style.top = currentTop;

        // Persist data in memory and UI
        weights.push(weightData);
        addLogEntry(weightData);
        calculateTorques();
        generateNextWeight();
    };

    ball.addEventListener("transitionend", onTransitionEnd);
    //console.log("side:", side, "distance:", distance);
});

/**
 * Recalculates torques for left and right, updates
 * the seesaw angle, total weights and tilt indicator.
 * Also saves the current state to localStorage.
 */
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
    //console.log("Left Torque:", leftTorque, "Right Torque:", rightTorque);
    const netTorque = rightTorque - leftTorque;
    //console.log("Net Torque:", netTorque);
    // Simple scaling: clamp tilt between -30 and +30 degrees
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
    saveState();
}

/**
 * Resets the whole simulation:
 * clears weights, angle, log and removes saved state.
 */
function resetSeesaw() {
    weights.length = 0;

    const balls = document.querySelectorAll(".weight-object");
    balls.forEach(ball => ball.remove());

    seesawGroup.style.transform = "rotate(0deg)";
    leftWeightElement.textContent = "0.0 kg";
    rightWeightElement.textContent = "0.0 kg";
    tiltAngleElement.textContent = "0.0°";

    localStorage.removeItem("seesawState");

    if(dropLog) {
        dropLog.innerHTML = "";
    }

    generateNextWeight();
}

resetButton.addEventListener("click", resetSeesaw);

/**
 * Saves the current state (weights + next weight)
 * to localStorage so the user can refresh and continue.
 */
function saveState() {
    const state = {
        weights: weights,
        nextWeight: nextWeight
    };

    localStorage.setItem("seesawState", JSON.stringify(state));
}

/**
 * Loads a previous state from localStorage if available.
 * Rebuilds weights, next weight, balls on screen and log,
 * then recalculates torques.
 */
function loadState() {
    const saved = localStorage.getItem("seesawState");

    if(!saved) {
        generateNextWeight();
        return;
    }

    const state = JSON.parse(saved);

    weights.length = 0;
    if(Array.isArray(state.weights)) {
        for (const w of state.weights) {
            weights.push(w);
        }
    }

    if(typeof state.nextWeight === "number") {
        nextWeight = state.nextWeight;
        nextWeightElement.textContent = `${nextWeight} kg`;
    } else {
        generateNextWeight();
    }
    
    renderBallsFromState();
    rebuildLogFromState();
    calculateTorques();
}

/**
 * Recreates all weight balls from the saved state.
 * Uses side + distance to position each ball relative to the pivot.
 */
function renderBallsFromState() {
    // Get the current positions of the playground and seesaw
    const rect = playground.getBoundingClientRect();
    const seesawRect = seesaw.getBoundingClientRect();
    const seesawLeft = seesawRect.left - rect.left;
    const seesawRight = seesawLeft + seesawRect.width;
    const seesawCenterY = (seesawRect.top - rect.top) + seesawRect.height / 2;
    const pivotX = (seesawLeft + seesawRight) / 2;
    // Remove any existing balls (if present)
    const oldBalls = document.querySelectorAll(".weight-object");
    oldBalls.forEach(ball => ball.remove());

    // Recreate each saved weight as a ball on the seesaw
    for (const w of weights) {
        const ball = document.createElement("div");
        ball.classList.add("weight-object");
        ball.textContent = w.weight + "kg";

        // Use saved color if available, fallback to a random one
        let color = w.color;
        if(!color){
            const randomIndex = Math.floor(Math.random() * COLORS.length);
            color = COLORS[randomIndex];
        }
        ball.style.backgroundColor = color;

        // Size again based on weight
        const size = 20 + w.weight * 4;
        ball.style.width = size + "px";
        ball.style.height = size + "px";

         // Position relative to pivot using stored distance and side
        let x = pivotX;
        if (w.side === "left") { 
            x = pivotX - w.distance;
        }else if (w.side === "right") {
            x = pivotX + w.distance;
        }

        ball.style.left = x + "px";
        ball.style.top = seesawCenterY + "px";
        ball.style.opacity = "1";

        seesawGroup.appendChild(ball);
    }
}

/**
 * Adds a single log entry line for a new dropped weight.
 * Used both when the user drops a weight and when rebuilding from state.
 */
function addLogEntry(w) {
    if(!dropLog) return;

    const li = document.createElement("li");
    li.classList.add("log-item");

    const bullet = document.createElement("span"); 
    bullet.classList.add("log-bullet");
    bullet.style.backgroundColor = w.color || "#e67e22";

    li.style.borderLeftColor = w.color || "#e67e22";

    const text = document.createElement("span");
    let sideText;
    
    if (w.side === "left") {
        sideText = "left side";
    } else if (w.side === "right") {
        sideText = "right side";
    } else {
        sideText = "center";
    }

    const distancePx = Math.round(w.distance);
    text.textContent = `${w.weight}kg dropped on ${sideText} at ${distancePx}px from pivot.`;

    li.appendChild(bullet);
    li.appendChild(text);
    dropLog.appendChild(li);
}

/**
 * Clears the existing log UI and rebuilds it
 * from the current weights array.
 */
function rebuildLogFromState() {
    if(!dropLog) return;

    dropLog.innerHTML = "";
    for(const w of weights) {
        addLogEntry(w);
    }
}



