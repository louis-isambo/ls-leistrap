import { leistrap } from "../cors/leistrap.js";
import accordionCss from "./accordion.css"
import { loopObject } from "../../utility/index.js"

/**
 * leistrap accordion component
 * @param {leistrap.Leistrap<HTMLElement>} parent   the component parent
 */
export function leisAccordion(parent) {
    leistrap.addCss(accordionCss)

    const container = leistrap.create("div", { className: "leis-accordion-card", parent })
    const header = leistrap.create("div", { className: "leis-accordion-head", parent: container })
    const body = leistrap.create("div", { parent: container })
    const footer = leistrap.create("div", { parent: container, className: "leis-accordion-footer" })
    /**
     * add a new section 
     * @param {string} btnText 
     * @param {leistrap.Leistrap<HTMLElement>} content 
     */
    function add(btnText, AccContent) {
        const button = leistrap.create("button",
            {
                type: "button",
                className: "leis-accordion-btn",
                parent: body,
                text: btnText,
                style : ACCORDION.btnStyle
            })
        const content = leistrap.create("div", {
            parent: body,
            className: "leis-accordion-panel",
            content: [AccContent]
        })
        button.addEvent("click", function () {
            this.toggleClassName("active")
            content.toggleClassName("active")
        })

        return button
    }

    function destroy() {
        container.destroy()
        loopObject(ACCORDION, (value, key) => delete ACCORDION[key])
    }

    const ACCORDION = {
        container, add, header, footer, body, destroy, btnStyle: {}
    }

    return ACCORDION
}