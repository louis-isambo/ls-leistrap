import { rangeList } from "../../utility/index.js";
import { leistrap } from "../cors/leistrap.js";
import { leisMenu } from "./menu.js";





leistrap.whenReady(function(){
    this.add(leistrap.create("p", {text: "Hello world "}))
    let m = leisMenu(null)
    let sm = leisMenu(null, "sb-m")
    sm.pop.pop.setStyleSheet({
        width : '200px',
        height : "300px"
    
    })

    let sm2 = leisMenu(null, "sb-m")
    sm2.pop.pop.setStyleSheet({
        width : '200px',
        height : "300px"
    
    })

    let sm3 = leisMenu(null, "sb-m")
    sm3.pop.pop.setStyleSheet({
        width : '200px',
        height : "300px"
    
    })

    sm.addOption(null, "hey", "c",  sm2)
    m.listen("contextmenu")
    m.addOption(null, `menu item`, "copy ", sm)
    sm.addOption(null, `menu item`, "copy ", sm3)
    rangeList(12).forEach(function(item){
        m.addOption(null, `menu item ${item}`, "copy " + item.toString())
        .addEvent("click", ()=> console.log(m.target))
    })

    m.pop.pop.setStyleSheet({
        width : "250px"
    })
})

leistrap.render("main")