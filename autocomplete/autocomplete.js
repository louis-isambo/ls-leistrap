import { leistrap } from "../cors/leistrap.js";
import { has, isEmpty, isObject } from "../../utility/index.js";
import autCss from "./style.css"


leistrap.addCss(autCss)
/**
 * 
 * @param {leistrap.Leistrap<HTMLElement>} parent 
 * @param {Array<{
 * item : string, 
 * icon : leistrap.Leistrap<HTMLElement>,
 * subTitle : string
 * } & string>} data 
 * @param {leistrap.Leistrap<HTMLInputElement>} input 
 * @param {(item)=>void} onSelect 
 * @param {number} limit 
 * @param {boolean} rOnly 
 */
function autoComplete(parent, input, data, onSelect, rOnly, limit = 10) {


    let timer;
    const container = leistrap.create("div", {
        parent,
        className: "leis-autoComplete"
    })

    let listItem = setListItem()

    input.addEvent('input', async function (event) {
        let text = this._conf.value


        if (!isEmpty(text)) {
            container.show()
            if (timer) clearTimeout(timer)

            timer = setTimeout(search, 700, text)

        }
        else {
            container.hide();
            if (timer) clearTimeout(timer)

        }
    })

    function search(txtInput, dataSet) {
        listItem.destroy()
        listItem = setListItem()
        let itemFind = false
        let counterResult = 0

        for (let x = 0; x < data.length; x++) {
            let item = data[x]
            let txt = isObject(item) ? item.item : item

            if (has(txtInput.toLocaleLowerCase(), txt.toLocaleLowerCase()) && counterResult <= limit) {
                leistrap.create("li", { parent: listItem, text: txt, className: "autoItem" })
                    .addEvent("click", function () {
                        input._conf.value = txt
                        if(onSelect) onSelect(item)
                        container.hide()
                    })
                itemFind = true
                counterResult++
            }
            if (counterResult == limit) break;
        }


        if (!itemFind) {
            container.hide()
        }
    }

    function setListItem() {
        return leistrap.create("ul", {
            parent: container,
            className: "lis-autoListItem",

        })
    }

    if(rOnly){
        input.addAttr("readonly", "true")
       input.addEvent("click", function(){
        listItem.destroy()
        listItem = setListItem()
        container.show()
        data.forEach(function(item){
            let txt = isObject(item) ? item.item : item
            leistrap.create("li", { parent: listItem, text: txt, className: "autoItem" })
            .addEvent("click", function () {
                input._conf.value = txt
                if(onSelect) onSelect(item, txt)
                container.hide()
            })
        })
       })

    }

    input.addEvent("focus", function(){
        container.show()
    })

    input.addEvent("blur", function(e){
        setTimeout(function(){container.hide()}, 600)
    })
    return container
}


export { autoComplete }
