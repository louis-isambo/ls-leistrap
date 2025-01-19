let rotatableElement = document.getElementById('rotatable');

// Variables to store rotation state
let isDragging = false;
let totalRotation = 0;  // Track the cumulative rotation
let initialAngle = 0;
let centerX, centerY, startX, startY;

// Step 1: Add 'mousedown' event listener
rotatableElement.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;

    // Step 2: Get the center of the element
    let rect = rotatableElement.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    // Step 3: Calculate the starting angle relative to the mouse position
    startX = e.clientX - centerX;
    startY = e.clientY - centerY;
    initialAngle = Math.atan2(startY, startX);

    // Add mousemove and mouseup listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Step 4: Function to handle mouse movement for smooth rotation
function onMouseMove(e) {
    if (!isDragging) return;

    // Calculate the new mouse position relative to the center of the element
    let currentX = e.clientX - centerX;
    let currentY = e.clientY - centerY;

    // Calculate the new angle relative to the current mouse position
    let currentAngle = Math.atan2(currentY, currentX);
    let angleDiff = currentAngle - initialAngle;

    // Convert the angle difference to degrees and update total rotation
    let degrees = angleDiff * (180 / Math.PI);
    let newRotation = totalRotation + degrees;

    // Apply the smooth rotation to the element
    rotatableElement.style.transform = `rotate(${newRotation}deg)`;
}

// Step 5: Stop rotation on 'mouseup'
function onMouseUp() {
    isDragging = false;

    // Save the total rotation so that the next drag continues from this point
    let currentTransform = getComputedStyle(rotatableElement).transform;

    // Extract the current rotation from the CSS matrix and save it to totalRotation
    if (currentTransform !== 'none') {
        let values = currentTransform.split('(')[1].split(')')[0].split(',');
        let a = values[0];
        let b = values[1];
        let currentAngle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        totalRotation = currentAngle;
    }

    // Remove the mousemove and mouseup listeners to stop rotation
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
