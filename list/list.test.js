import { leistrap } from "../cors/leistrap.js";
import { createAccList, createList } from "./list.js";



leistrap.whenReady(function(){

    const data = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"
                ]

    const list = createList(data, "checkbox", function(item){
        console.log(item);
        
    })
    list.active("January")
  

    
    let acc = createAccList("Months")
    acc.add({btnText: "Months", data})
    acc.add({btnText: "Days", data})
    acc.add({btnText: "Days", data})
    acc.container.setStyleSheet({width: "50%"})
    this.add(acc.container)


})

leistrap.render("main")