import {leistrap} from "../cors/leistrap.js"
import {btnRadio, checkBox, switchBox} from "../input/leisInput.js"
import { _EventEmitter, generateId, has } from "../../utility/index.js"
import listCss from "./css/lust.css"
import {leisAccordion} from "../accordion/accordion.js"

leistrap.addCss(listCss)

function createAccList(){
   const acc =  leisAccordion(null)
   acc.btnStyle = {
        position : "sticky",
        top : "0",
        left : '0',
        zIndex: '1',
        backgroundColor : "#fff"
   }
   acc.header.destroy()
   acc.footer.destroy()
   acc.container.setStyleSheet({
    border: "none",
    boxShadow : "none",
    borderRadius : "8px"
   })

   function add ({btnText, data, btnType, onActive, onDisable}){
        const items = createList(data, btnType, function(elem){
           if(btnText == "radioBtn" || !btnType){
                title.setText(elem)
           }
            if(onActive) onActive(elem)
        }, function(elem){
            title.setText(" ")
            if(onDisable) onDisable(elem)
        })
        let itemBtn = acc.add(btnText, items.group)
        let title = leistrap.create("p", {parent: itemBtn, className: "ti-al"})
        return items
   }


   return {
    container : acc.container,
    add
   }
}



const btnType = {
    switchBox, 
    btnRadio,
    checkBox
}

/**
 * 
 * @param {Array} data 
 * @param { "btnRadio" | "checkBox" |"switchBox"} type_ 
 * @returns 
 */
function createList(data, type_, onActive, onDisable){

    const event = _EventEmitter()
    const key = generateId(2, 5)
    const ul = leistrap.create("ul", {
        className : "ls-l",
        style : {border : "none", position : "relative", zIndex : 0}
    })
    
    if(!has(type_, btnType)) type_ = "btnRadio"
    
    data.forEach(function(item){

        const RDB = btnType[type_](null, item, function(){
           if(onActive) onActive(item)
        }, function(){
            if(onDisable) onDisable(item)
        })

        RDB.container.setStyleSheet({
            margin : "0px",
            padding : "0",
            flexDirection : "row-reverse",
            alignItems : "center",
            alignContent : "center",
            justifyContent : "space-between"
        }).setClassName("leis-flex  ls-ii").addEvent("click", function(e){
            if(e.target.currentElement.key === this.key)
                RDB.label._conf.click()       
                 
        })
        
        RDB.input.setClassName("ls-in")
        RDB.label.setClassName("ls-ll leis-flex leis-row").addEvent("click",
            function(e){e.stopImmediatePropagation()})
        RDB.input.addAttr("name", key)

        const LI = leistrap.create("li", {
            className : "ls-i",
            parent : ul,
            content : [RDB.container]
        })

        event.handle(item, function(e){
            RDB.input._conf.checked = false
            RDB.input._conf.click()
        })
        event.handle(item+"disable", function(e){
            RDB.input._conf.checked = true
            RDB.input._conf.click()
        })

        event.handle(item+"remove", function(e){
            LI.destroy()
            
        })
    })

    function active(item){
        event.invoke(item)
    }

    function disable(item){
        event.invoke(item+"disable")
    }
    function remove(item){
        event.invoke(item+"remove")
    }
    const LIST = {
        group : ul,
        active,
        disable,
        remove

    }
    return LIST
}

export {createList, createAccList}