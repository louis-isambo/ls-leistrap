// Get the element to rotate
let rotatableElement = document.getElementById('rotatable');

// Variables to store the initial state
let isDragging = false;
let initialAngle = 0;
let centerX, centerY, startX, startY;


// Step 1: Add mousedown event listener
rotatableElement.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;

    // Step 2: Get the center of the element
    let rect = rotatableElement.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    // Step 3: Calculate the starting angle based on the mouse position
    startX = e.clientX - centerX;
    startY = e.clientY - centerY;
    initialAngle = Math.atan2(startY, startX);

    // Add mousemove and mouseup event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Step 4: Function to handle mouse movement
function onMouseMove(e) {
    if (!isDragging) return;

    // Calculate the new mouse position relative to the center
    let currentX = e.clientX - centerX;
    let currentY = e.clientY - centerY;

    // Calculate the new angle
    let currentAngle = Math.atan2(currentY, currentX);
    let angleDiff = currentAngle - initialAngle;

    // Convert the angle difference to degrees
    let degrees = angleDiff * (180 / Math.PI);

    // Apply the rotation to the element
    rotatableElement.style.transform = `rotate(${degrees}deg)`;
  
}

// Step 5: Stop rotating on mouseup
function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
   
}
