import css from "./css/resizable.css"
import { leistrap } from "../cors/leistrap.js";
import { Draggable } from "./draggable.js";
import { Resizable } from "./resizable.js";
import { loopObject } from "../../utility/index.js";

leistrap.addCss(css)
const ELEMENTS_MAP = {}

const leisDraggable = Draggable
const leisResizable = (element, parent) => {
    const elem = leistrap.create('div', {
        parent,
        className: "resize-box",
        content: [element],
        onclick: function (e) {
            e.stopPropagation()
            loopObject(ELEMENTS_MAP).forEach(item => item.removeClassName("selected"))
            elem.setClassName("selected")


        }
    }).addAttr("tabindex", "0")

    ELEMENTS_MAP[elem.key] = elem
    Resizable(elem._conf, element._conf, 2)

    // listen to the destroy element event
    elem.once("destroy", function () {
        delete ELEMENTS_MAP[elem.key]
    })
    return elem
}

// hidden all element once the window is click
leistrap.hideWhenWinClick(() => loopObject(ELEMENTS_MAP)
    .forEach(item => item.removeClassName("selected")))
export { leisDraggable, leisResizable }