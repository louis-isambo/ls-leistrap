

/**
 * 
 * @param {HTMLElement} parent 
 * @param {BaseElement} element 
 */
function Render(parent, element) {

    setTimeout(function () {
        parent.append(element.render())
    }, 300)

}

export { Render }