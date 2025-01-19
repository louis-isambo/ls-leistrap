import { rangeList } from "../../utility/index.js";
import { leistrap } from "../cors/leistrap";
import { leisAccordion } from "./accordion.js";


leistrap.whenReady(function(){
    let acc = leisAccordion(this)
   rangeList(20).forEach(function(item){
        acc.add("acco item "+ item, leistrap.create("div", {text : "accordion content "+item}))
   })

   acc.container.setStyleSheet({
    width : "50%"
   })
})

leistrap.render("main")