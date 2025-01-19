import { leistrap } from "../cors/leistrap.js"
import leisButtonCss from "./button.css"

let init = false
let leisButton = () => {
    if (!init) {
        init = true
        return leisButtonCss
    }
    return null
}

function CloseBtn(parent) {
    return leistrap.create("button", {
        content: [leistrap.create('span', { innerHTML: "&times" })],
        className: 'leis-btn-close',
        parent
    })
}

export {
    leisButton,
    CloseBtn
}