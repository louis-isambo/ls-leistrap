

/**
 * drag event
 * @param {HTMLElement} element
 * @type {{
 * dx: number,
 * dy:number,
 * startY: number,
 * startX : number,
 * target : HTMLElement
 * }} draggableEvent
 * 
 * @param {{
 * end? : (option : draggableEvent)=> void,
 * move? : (option : draggableEvent)=> void,
 * start? : (option : draggableEvent)=> void,
 * autoDragging? : Boolean,
 * targetBind : HTMLElement,
 * preventDefault : Boolean
 * }} option
 */

function Draggable(element, option = {}) {

    // Variables to store initial positions
    let startX, startY, initialMouseX, initialMouseY, startWidth, startHeight;
    let targetBind;
    let dx, dy;

    let start, counter

    // Step 2: Add 'mousedown' event listener to start dragging
    element.addEventListener('mousedown', function (e) {
        if (option.init) option.init(e)
        if (option.preventDefault) e.preventDefault()
        // check the start event
        counter = 1;
        // Record initial mouse position
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;

        // Capture the element's initial position
        startX = element.offsetLeft;
        startY = element.offsetTop;
        startWidth = element.offsetWidth
        startHeight = element.offsetHeight
        if (option.targetBind) {
            targetBind = {
                width: option.targetBind.offsetWidth,
                height: option.targetBind.offsetHeight,
                x: option.targetBind.offsetLeft,
                y: option.targetBind.offsetTop
            }
        }

        // Step 3: Add event listeners for mousemove and mouseup
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Step 4: Define function to handle 'mousemove'
    function onMouseMove(e) {
        if (option.preventDefault) e.preventDefault()
        // Calculate how far the mouse has moved 
        dx = e.clientX - initialMouseX;
        dy = e.clientY - initialMouseY;

        //check the starting drag event
        if (counter) counter++
        if (counter === 3) {
            counter = null
            if (option.start) option.start({ target: element, dx, dy, startX, startY })
            start = true
        }

        if (option.move) option.move({
            target: element,
            dx, dy, startX, startY, startHeight, startWidth,
            initialMouseX, initialMouseY, event: e, targetBind
        })
        if (option.autoDragging && !element.resizable) {
            // Update the element's position
            element.style.left = startX + dx + 'px';
            element.style.top = startY + dy + 'px';
        }
    }

    // Step 5: Define function to stop dragging
    function onMouseUp() {
        // Remove 'mousemove' event when mouse button is released
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (start && option.end) {
            option.end({ target: element, dx, dy, startX, startY })
            start = false
            counter = null
        }

        element.resizable = false

    }

}

export { Draggable }