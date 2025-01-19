/**
 * 
 * @param {'absolute'} position 
 * @param {{
 * container: HTMLElement,
 * popUp : HTMLElement,
 * side  : Array<"top"|"bottom"|'left'|'right'>,
 * rect? : {x: number, y : number, top: number, left : number, width: number, height : number} 
 * popUpRect? : {x: number, y : number, top: number, left : number, width: number, height : number} 
 * }} option 
 */
function setPopPosition(position, option) {

    // check if the  popup dialog is visible or not
    let show = false

    if (!option) option = {}
    if (!option.side) option.side = ["top", 'bottom']
    if (position == "absolute") absolutePosition(option.container, option.popUp, option.rect, option.popUpRect)


    /**
     * @param {HTMLElement} container 
     * @param {HTMLElement} popUp 
     */
    function absolutePosition(container, popUp, defRct, popUpRect) {
        show = false
        // check left side
        const rect = defRct || container.getClientRects()[0]
        const popRect = popUpRect || popUp.getClientRects()[0]
        const gap = option.gap || 10
        const SIDE = { TOP, BOTTOM, LEFT, RIGHT }

        if (option.side) {
            option.side.forEach(item => {
                if (SIDE[item.toUpperCase()] && !show) {
                    SIDE[item.toUpperCase()]()
                }

            });

        }
        function LEFT() {
            // left side
            if (rect.left + gap >= popRect.width) {
                if (rect.top + gap >= popRect.height) {
                    popUp.style.left = (rect.left - popRect.width).toString() + "px"
                    popUp.style.top = ((rect.top - popRect.height) + rect.height).toString() + "px"
                    show = true
                }
                else if (window.innerHeight - (rect.top + gap + rect.height) >= popRect.height) {
                    popUp.style.left = (rect.left - popRect.width).toString() + "px"
                    popUp.style.top = (rect.top).toString() + "px"
                    show = true
                }

            }
        }

        function BOTTOM() {
            // bottom side

            if (window.innerHeight - (rect.top + rect.height + gap) >= popRect.height) {
                //bottom right
                if (window.innerWidth - (rect.x + gap) >= popRect.width) {
                    popUp.style.top = (rect.top + rect.height).toString() + "px"
                    popUp.style.left = (rect.x).toString() + "px"
                    show = true
                }
                else {
                    popUp.style.top = (rect.top + rect.height).toString() + "px"
                    let left = ((rect.x + rect.width) - popRect.width)
                    if (left <= 0) left = gap
                    popUp.style.left = left.toString() + "px"
                    show = true
                }

            }
        }

        function TOP() {
            // top side

            if (rect.top + gap >= popRect.height) {
                //top right

                if (window.innerWidth - (rect.x + gap) >= popRect.width) {
                    popUp.style.top = (rect.top - popRect.height).toString() + "px"
                    popUp.style.left = (rect.x).toString() + "px"
                    show = true
                }
                else {
                    popUp.style.top = (rect.top - popRect.height).toString() + "px"
                    let left = ((rect.x + rect.width) - popRect.width)
                    if (left <= 0) left = gap
                    popUp.style.left = left.toString() + "px"
                    show = true

                }

            }
        }


        function RIGHT() {
            // right side

            if (window.innerWidth - (rect.x + rect.width) >= popRect.width) {

                // right top
                if (rect.top + gap >= popRect.height) {
                    popUp.style.top = ((rect.top + rect.height) - popRect.height).toString() + "px"
                    popUp.style.left = (rect.x + rect.width).toString() + "px"
                    show = true
                }
                else {
                    let top = (rect.top + rect.height) - gap
                    if ((top + popRect.height) > window.innerHeight) {
                        let cp = top - ((top + popRect.height + gap) - window.innerHeight)
                        top = cp
                    }
                    popUp.style.top = top.toString() + "px"
                    popUp.style.left = ((rect.x + rect.width) - gap).toString() + "px"
                    show = true
                }

            }

        }
    }

    // when there s no place to play the pop up  let set a default style value
    if (!show) {
        option.popUp.style.top = "10px"
        option.popUp.style.left = "10px"
    }
}


export { setPopPosition }