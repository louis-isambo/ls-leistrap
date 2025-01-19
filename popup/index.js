import { leistrap } from "../cors/leistrap.js"
import { copyObject, has, loopObject, rangeList, tryCode } from "../../utility/index.js"
import { shortCut } from "../shortCut/shortCut.js"
import popCss from "./css/pop.css"
import { setPopPosition } from "./popup.js"
import {Draggable} from "../mouseEvent/draggable.js"


const DROP_MAP = {}
let ZIndex = 1
leistrap.addCss(popCss)

/**
 * @param {leistrap.Leistrap<HTMLElement>} button the button once clicked show the popup
 * @param {Array<"left" | "right" |"top" |"bottom">} side 
 * @param {boolean} [drag=true] 
 */
function DropUp(button, side, drag=true) {

    // all eventListeners
    const eventMap = {}

    // h custom property
    let action;;

    const pop = leistrap.create("div", {
        parent: "main",
        className: "leis-dropdown-content leis-pop",
        onclick: (e) => {
            e.stopPropagation()
            if (eventMap.click) eventMap.click.forEach(item => item())
        }
    })
    pop.state.visible = false

    setBtn(button)

    if(drag){
        Draggable(pop._conf, {
            autoDragging : true
        })
    }

    /** 
     * associate a button to the popup container */
    function setBtn(btn) {
        if (btn) {
            btn.addEvent("click", function (e) {
                tryCode(()=>{
                    if (e) e.stopPropagation()
                        show(btn.popInstance)
                        setPopPosition("absolute", {
                            container: this._conf,
                            popUp: pop._conf,
                            side: side || ["bottom", "top", "right", "left"]
                        })
                        pop.setClassName("zoom-out")
                })
            })
        }
    }

    /**
     * 
     * @param {{x: number, 
     * y : number,
     *  top: number, 
     * left : number, 
     * width: number, 
     * height : number} } rect the position for moving the popUp
     */
    function move(rect, side) {
        show()
        setPopPosition("absolute", {
            rect,
            popUp: pop._conf,
            side: side || ["bottom", "top", "right", "left"]
        })
    }

    /**
     * @param {"hide" | "show" |"click"} eventName 
     * @param {()=> void} listener 
     */
    function once(eventName, listener) {
        if (!has(eventName, eventMap)) eventMap[eventName] = []
        eventMap[eventName].push(listener)
    }


    /**
     * show the component
     * @param {Boolean} newInstance 
     */
    function show(newInstance) {
        if (!pop.state.visible || newInstance) {
            pop.setClassName("show")
            pop.setStyleSheet({ zIndex: ZIndex++ })
            if (eventMap.show) eventMap.show.forEach(item => item())
            pop.state.visible = true
        }
    }

    /**
     * hide the component
     */
    function hide() {
        if (pop.state.visible) {
            pop.removeClassName("show")
            if (eventMap.hide) eventMap.hide.forEach(item => item())
            pop.state.visible = false
        }

        pop.removeClassName("zoom-out")
    }

    const POP_UP = {
        pop,
        move,
        setBtn,
        show,
        hide,
        once,

        /**
         * this  property listen to the changes and it's overwrite
         * @type {(arg)=> void} 
         */
        action,
        children : []
    }

    // push the dropUp object to the DROP_MAP 
    DROP_MAP[pop.key] = POP_UP

    return POP_UP
}



// hide all popup whn window is clicked
leistrap.hideWhenWinClick(HIDE)
shortCut(window)
window.bind("esc", HIDE)

leistrap.event.handle("hidepopup", function(e, ...exc){
    if(!exc) exc = []
    loopObject(copyObject(DROP_MAP, false, false)).forEach(pop => {
        if(!has(pop.pop.key, exc))   pop.hide()
      
    })
    
})

function HIDE (e) {
    const exc = e.target.exc || []

    if(!(e.target.id === "leis-color"))
    
    loopObject(copyObject(DROP_MAP, false, false, ...exc)).forEach(pop => {
        pop.hide()
    })
}


export { DropUp }
