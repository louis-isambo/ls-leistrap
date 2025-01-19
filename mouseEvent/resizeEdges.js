let resizableElement = document.getElementById('resizable');

// Variables for the initial size and position
let startWidth, startHeight, startX, startY, startMouseX, startMouseY;

// Minimum and maximum size restrictions
let minWidth = 100, minHeight = 100, maxWidth = 500, maxHeight = 400;

// Function to start resizing based on the handle being clicked
function onMouseDown(e, direction) {
    // Prevent text selection
    e.preventDefault();

    // Record initial sizes and positions
    startWidth = resizableElement.offsetWidth;
    startHeight = resizableElement.offsetHeight;
    startX = resizableElement.offsetLeft;
    startY = resizableElement.offsetTop;
    startMouseX = e.clientX;
    startMouseY = e.clientY;

    // Add the mousemove and mouseup listeners
    document.addEventListener('mousemove', (ev) => onMouseMove(ev, direction));
    document.addEventListener('mouseup', onMouseUp);
}

// Function to handle the actual resizing
function onMouseMove(e, direction) {
    if (direction === 'right') {
        let newWidth = startWidth + (e.clientX - startMouseX);
        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
        }
    } else if (direction === 'left') {
        let newWidth = startWidth - (e.clientX - startMouseX);
        if (newWidth > minWidth && newWidth < maxWidth) {
            resizableElement.style.width = newWidth + 'px';
            resizableElement.style.left = startX + (e.clientX - startMouseX) + 'px';
        }
    } else if (direction === 'bottom') {
        let newHeight = startHeight + (e.clientY - startMouseY);
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
        }
    } else if (direction === 'top') {
        let newHeight = startHeight - (e.clientY - startMouseY);
        if (newHeight > minHeight && newHeight < maxHeight) {
            resizableElement.style.height = newHeight + 'px';
            resizableElement.style.top = startY + (e.clientY - startMouseY) + 'px';
        }
    }
}

// Function to stop resizing
function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Add event listeners for all handles
document.querySelector('.resize-handle.right').addEventListener('mousedown', (e) => onMouseDown(e, 'right'));
document.querySelector('.resize-handle.left').addEventListener('mousedown', (e) => onMouseDown(e, 'left'));
document.querySelector('.resize-handle.bottom').addEventListener('mousedown', (e) => onMouseDown(e, 'bottom'));
document.querySelector('.resize-handle.top').addEventListener('mousedown', (e) => onMouseDown(e, 'top'));
