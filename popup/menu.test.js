import { rangeList } from "../../utility/index.js";
import { leistrap } from "../cors/leistrap.js";
import { leisMenu } from "./menu.js";





leistrap.whenReady(function(){
    let m = leisMenu()
    rangeList(12).forEach(function(item){
        m.addOption(null, `menu item ${item}`, "copy " + item.toString())
    })

    m.pop.pop.setStyleSheet({
        width : "250px"
    })
})

leistrap.render("main")