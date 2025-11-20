# Seesaw Simulation – Bahri Keskin

A simple physics-based seesaw simulation built with **pure HTML, CSS, and JavaScript**.  
Users drop weights on the seesaw, and the system calculates torque and adjusts the rotation accordingly.

---

## How to Run
1. Download or clone the repo  
2. Open **index.html** in a browser  
3. Click anywhere on the seesaw to drop a weight  

No build tools required.

---

## Main Features
- Random weight generation (1–10 kg)  
- Torque-based left/right balance calculation  
- Smooth falling animation  
- Rotation via CSS transform  
- Hover distance preview  
- Drop log (weight, side, distance)  
- Sound effect on landing  
- LocalStorage state saving  
- Reset button  
- Basic reponsive UI 

---

## Thought Process & Design Choices

The simulation uses a simplified physics model:

`torque = weight × distance_from_pivot`

The seesaw rotation angle is computed as:

`angle = clamp((rightTorque - leftTorque) / 10, -30, 30)`

All moving parts are wrapped inside `#seesaw-group`, so the bar and all dropped balls rotate together.  
I focused on keeping the logic small, readable and easy to debug while still giving a smooth user experience.

---

## Trade-offs & Limitations

- Many balls on screen may affect DOM performance  
- The seesaw bar itself has no mass; only dropped weights affect the torque.
- Rotation jumps directly to the final angle instead of using real angular acceleration.
- All event listeners (click, mousemove, mouseleave) live inside a single script file. Modularization would improve clarity, but was skipped to keep the project compact.


---

## AI Assistance

AI was used only for:

- Preparing the README text
- Spotting small typos and minor syntax issues
- Simple UI suggestions (colors, spacing)
- General hints during debugging of DOM interactions and the save/load logic

