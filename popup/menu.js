
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
     * @param {leistrap.Leistrap<HTMLElement>} win
     */
    function listen(elem, evName, win, option){
        win = win || leistrap.win
      win.addEvent(evName, function (e) {
            e.preventDefault()
           if(!elem){
            move()
            return;
           }
            if(elem && elem._conf === e.target){
                move()
           }
           
           function move(){
            MENU.target = e.target
            let [x, y] = [e.clientX, e.clientY]
            if(MENU.page){
                
                let rect = MENU.page._conf.getBoundingClientRect()
                x += rect.x
                y += rect.y 
                // console.log(option.x, option.y);
                
          
            }
           
            
            pop.move({
                x,
                y,
                left: x,
                top: y,
                height: 10,
                width: 10
            })
           }

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
            
            li.content[2].setText("").setClassName("sb-m")
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