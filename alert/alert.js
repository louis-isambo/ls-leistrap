import { leistrap } from "../cors/leistrap.js"
import { has, loopObject } from  "../../utility/index.js"
/**
 * 
 * @param {leistrap.Leistrap<HTMLElement>} parent 
 * @param { leistrap.colors} type 
 * @param {string} text 
 * @returns 
 */
function leisAlert(parent, type, text) {

    let colorType = type || "primary"
    const container = leistrap.create("div", {
        parent,
        className: 'leis-alert-card leis-alert-' + colorType
    })
    const body = leistrap.create("div", {
        className: "leis-alert-text",
        parent: container,
        text
    })
    /**
     *@param{leistrap.colors} colorName
     */
    function setColor(colorName) {
        if (has(colorName, leistrap.Colors)) {
            container.removeClassName("leis-alert-" + colorType)
            container.setClassName("leis-alert-" + colorName)
        }
    }
    function destroy() {
        container.destroy()
        body.destroy()
        loopObject((value, key) => delete ALERT[key])
    }
    const ALERT = { container, body, setColor, destroy }
    return ALERT
}

export { leisAlert }