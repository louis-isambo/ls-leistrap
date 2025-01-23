
import { leistrap } from "../cors/leistrap.js"
import { DropUp } from "./index.js"
import menuCss from "./css/menu.css"
import { rangeList } from "../../utility/index.js"


leistrap.addCss(menuCss)

function leisMenu(useIcon, parent) {
    const pop = DropUp(null, null, false, parent)
    /**
    * @type {leistrap.Leistrap<HTMLElement> | HTMLElement }
    */
    let target = null

    pop.pop.setClassName("leis-menu")
    const ul = leistrap.create("ul", {
        parent: pop.pop,
        className: "ls-ls-m",
        
    })


    /**
     * show the menu
     * @param {leistrap.Leistrap<HTMLElement>} elem 
     * @param {keyof WindowEventMap} evName 
     */
    function listen(elem, evName){
      elem.addEvent(evName, function (e) {
            e.preventDefault()
            MENU.target = e.target
            pop.move({
                x: e.clientX,
                y: e.clientY,
                left: e.clientX,
                top: e.clientY,
                height: 10,
                width: 10
            })
        })
    }

    function addOption(icon, title, subTitle, subMenu_){
        const li = leistrap.create("li", {
            className : "ls-m-i leis-flex leis-row",
            parent : ul,
            content : rangeList(3).map( item => leistrap.create("div", {
                className : `ls-i-${item}`
            }))
        })

 
        li.content[1].setText(title)
        if(subMenu_){
            li.add(subMenu_.pop.pop)
            
            li.content[2].setText("SubMenu")
            li.addEvent("mouseenter", (e)=> showSubMenu(subMenu_, e, li))
            li.addEvent("mouseleave", ()=> hideSubMenu(subMenu_))
            
        }
        else {
            li.content[2].setText(subTitle)
        }
        
        if(!useIcon){
            li.content[0].destroy()
            li.setClassName("nI")
        }
        return li
    }

    let MENU = {
        addOption,
        pop,
        target,
        listen
    }
    return MENU
}



let idMenu;
function showSubMenu(pop, e, elem){
    
    if(idMenu){
        clearTimeout(idMenu)
    }
    
    idMenu = setTimeout(function(){
        pop.pop.move(elem._conf.getBoundingClientRect(), ["left", "right"])
        clearTimeout(idMenu)
    }, 500)

}

function hideSubMenu(menu){
    if(idMenu){
        menu.pop.hide()
        clearTimeout(idMenu)
    }
     

}
export {leisMenu}