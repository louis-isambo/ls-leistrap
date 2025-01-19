
import { leistrap } from "../cors/leistrap.js"
import { DropUp } from "./index.js"
import menuCss from "./css/menu.css"
import { rangeList } from "../../utility/index.js"


leistrap.addCss(menuCss)

function leisMenu(useIcon) {
    const pop = DropUp(null, null, false)

    window.addEventListener("contextmenu", function (e) {
        e.preventDefault()
        pop.move({
            x: e.clientX,
            y: e.clientY,
            left: e.clientX,
            top: e.clientY,
            height: 10,
            width: 10
        })
    })

    pop.pop.setClassName("leis-menu")
    const ul = leistrap.create("ul", {
        parent: pop.pop,
        className: "ls-ls-m",
        
    })

    function addOption(icon, title, subTitle){
        const li = leistrap.create("li", {
            className : "ls-m-i leis-flex leis-row",
            parent : ul,
            content : rangeList(3).map( item => leistrap.create("div", {
                className : `ls-i-${item}`
            }))
        })

 
        li.content[1].setText(title)
        li.content[2].setText(subTitle)
        if(!useIcon){
            li.content[0].destroy()
            li.setClassName("nI")
        }
        return li
    }

    let MENU = {
        addOption,
        pop
    }
    return MENU
}




export {leisMenu}