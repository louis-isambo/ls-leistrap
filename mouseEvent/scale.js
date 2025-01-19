let rotatableElement = document.getElementById('rotatable');

// Variables to store rotation, scaling, and dragging state
let isDragging = false;
let totalRotation = 0; // Track cumulative rotation
let scale = 1;         // Track the current scale
let initialAngle = 0;
let centerX, centerY, startX, startY, initialDistance;

// Step 1: Add 'mousedown' event listener
rotatableElement.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;

    // Get the center of the element
    let rect = rotatableElement.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    // Calculate the starting angle relative to the mouse position
    startX = e.clientX - centerX;
    startY = e.clientY - centerY;
    initialAngle = Math.atan2(startY, startX);

    // Calculate the initial distance for scaling (distance from center to mouse)
    initialDistance = Math.sqrt(startX * startX + startY * startY);

    // Add mousemove and mouseup listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Step 2: Function to handle both rotation and scaling
function onMouseMove(e) {
    if (!isDragging) return;

    // Calculate the current mouse position relative to the center of the element
    let currentX = e.clientX - centerX;
    let currentY = e.clientY - centerY;

    // Calculate the new angle relative to the current mouse position
    let currentAngle = Math.atan2(currentY, currentX);
    let angleDiff = currentAngle - initialAngle;

    // Convert angle difference to degrees and add to total rotation
    let degrees = angleDiff * (180 / Math.PI);
    let newRotation = totalRotation + degrees;

    // Calculate the distance for scaling (distance from center to current mouse)
    let currentDistance = Math.sqrt(currentX * currentX + currentY * currentY);

    // Calculate the new scale based on how far the mouse has moved
    let scaleDiff = currentDistance / initialDistance;
    let newScale = scale * scaleDiff;

    // Apply both rotation and scaling using CSS transform
    rotatableElement.style.transform = `rotate(${newRotation}deg) scale(${newScale})`;
}

// Step 3: Stop the interaction on 'mouseup'
function onMouseUp() {
    isDragging = false;

    // Save the total rotation and scale for future drags
    let currentTransform = getComputedStyle(rotatableElement).transform;

    // Extract the current rotation and scale from the CSS matrix
    if (currentTransform !== 'none') {
        let values = currentTransform.split('(')[1].split(')')[0].split(',');
        let a = values[0];
        let b = values[1];
        let currentAngle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        totalRotation = currentAngle;

        // Calculate the current scale from the transform matrix
        let currentScaleX = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
        scale = currentScaleX; // Assuming uniform scaling, so we use the X scale
    }

    // Remove mousemove and mouseup listeners
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
