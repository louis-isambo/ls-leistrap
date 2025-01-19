// Step 1: Get the draggable element
let element = document.getElementById('draggable');

// Variables to store initial positions
let startX, startY, initialMouseX, initialMouseY;

// Step 2: Add 'mousedown' event listener to start dragging
element.addEventListener('mousedown', function(e) {
    // Record initial mouse position
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;

    // Capture the element's initial position
    startX = element.offsetLeft;
    startY = element.offsetTop;

    // Step 3: Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Step 4: Define function to handle 'mousemove'
function onMouseMove(e) {
    // Calculate how far the mouse has moved 
    let dx = e.clientX - initialMouseX;
    let dy = e.clientY - initialMouseY;

    // Update the element's position
    element.style.left = startX + dx + 'px';
    element.style.top = startY + dy + 'px';
}

// Step 5: Define function to stop dragging
function onMouseUp() {
    // Remove 'mousemove' event when mouse button is released
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
