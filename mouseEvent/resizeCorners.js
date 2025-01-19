let resizableElement = document.getElementById('resizable');

// Variables for the initial size and position
let startWidth, startHeight, startX, startY, startMouseX, startMouseY;

// Minimum and maximum size restrictions
let minWidth = 100, minHeight = 100, maxWidth = 500, maxHeight = 400;

// Function to start resizing based on the corner being clicked
function onMouseDown(e, direction) {
    e.preventDefault(); // Prevent default behavior (text selection, etc.)

    // Record initial sizes and positions
    startWidth = resizableElement.offsetWidth;
    startHeight = resizableElement.offsetHeight;
    startX = resizableElement.offsetLeft;
    startY = resizableElement.offsetTop;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    // Add mousemove and mouseup listeners for resizing
    document.addEventListener('mousemove', (ev) => onMouseMove(ev, direction));
    document.addEventListener('mouseup', onMouseUp);
}

// Function to handle the resizing from corners
function onMouseMove(e, direction) {
    let newWidth, newHeight;

    if (direction === 'top-left') {
        newWidth = startWidth - (e.clientX - startMouseX);
        newHeight = startHeight - (e.clientY - startMouseY);

        // Apply restrictions
        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
            resizableElement.style.left = startX + (e.clientX - startMouseX) + 'px';
        }
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
            resizableElement.style.top = startY + (e.clientY - startMouseY) + 'px';
        }
    } else if (direction === 'top-right') {
        newWidth = startWidth + (e.clientX - startMouseX);
        newHeight = startHeight - (e.clientY - startMouseY);

        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
        }
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
            resizableElement.style.top = startY + (e.clientY - startMouseY) + 'px';
        }
    } else if (direction === 'bottom-left') {
        newWidth = startWidth - (e.clientX - startMouseX);
        newHeight = startHeight + (e.clientY - startMouseY);

        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
            resizableElement.style.left = startX + (e.clientX - startMouseX) + 'px';
        }
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
        }
    } else if (direction === 'bottom-right') {
        newWidth = startWidth + (e.clientX - startMouseX);
        newHeight = startHeight + (e.clientY - startMouseY);

        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
        }
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
        }
    }
}

// Function to stop resizing
function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Add event listeners for all corner handles
document.querySelector('.resize-handle.top-left').addEventListener('mousedown', (e) => onMouseDown(e, 'top-left'));
document.querySelector('.resize-handle.top-right').addEventListener('mousedown', (e) => onMouseDown(e, 'top-right'));
document.querySelector('.resize-handle.bottom-left').addEventListener('mousedown', (e) => onMouseDown(e, 'bottom-left'));
document.querySelector('.resize-handle.bottom-right').addEventListener('mousedown', (e) => onMouseDown(e, 'bottom-right'));
