// Step 1: Get the resizable element and the resize handle
let resizableElement = document.getElementById('resizable');
let resizeHandle = document.getElementById('resize-handle');

// Variables to store the initial width, height, and mouse position
let startWidth, startHeight, startMouseX, startMouseY;

// Step 2: Add 'mousedown' event listener to start resizing
resizeHandle.addEventListener('mousedown', function(e) {
    // Prevent default behavior to avoid text selection
    e.preventDefault();

    // Record the initial width, height, and mouse position
    startWidth = resizableElement.offsetWidth;
    startHeight = resizableElement.offsetHeight;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    // Add event listeners for 'mousemove' and 'mouseup'
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

// Step 3: Define function to handle 'mousemove'
function onMouseMove(e) {
    // Calculate the difference in mouse position
    let dx = e.clientX - startMouseX;
    let dy = e.clientY - startMouseY;

    // Update the element's width and height based on the mouse movement
    resizableElement.style.width = startWidth + dx + 'px';
    resizableElement.style.height = startHeight + dy + 'px';
}

// Step 4: Define function to stop resizing
function onMouseUp() {
    // Remove event listeners to stop resizing
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
