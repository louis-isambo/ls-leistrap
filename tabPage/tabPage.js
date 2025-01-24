import { leistrap } from "../cors/leistrap.js";
import { generateId, has, loopObject, _EventEmitter } from "../../utility/index.js";
import tabCSS from "./tab.css"
import { DisplayError } from "../Errors/leisError.js"

/**
 * 
 * @param {{
 * btnParent : leistrap.Leistrap<HTMLElement>,
 * contentParent : leistrap.Leistrap<HTMLElement> 
 * }} option 
 */

export function leisTab(option) {

    let event = _EventEmitter()
    // the default tabButton tag
    let TAG_NAME = "button"

    if (!option) option = {}
    leistrap.addCss(tabCSS)

    // contains all tabs
    let tabMap = {}

    const buttonsContainer = leistrap.create("div",
        {
            className: "leis-tabs-card",
            parent: option.btnParent
        })

    const contentContainer = leistrap.create('div',
        {
            parent: option.contentParent,
            className: "leis-mainContentTab"
        })

    /**
     * crate the tab button  and its content
     * @param {string} btnName  the tabButton name , this must be unique
     * @param {leistrap.Leistrap<HTMLElement>} content  tab content to show 
     * once the button is clicked
     * @param {{
     * createButton?:boolean,
     * buttonText ; string
     * }} options 
     * @returns {leistrap.Leistrap<HTMLButtonElement> | null}
     */
    function define(btnName, content, options) {
        let result = null
        let btn = null
        if (!options) options = {}

        if (!has(btnName, tabMap)) {
            content.setClassName("leis-tab-content")
            if (options.createButton) {
                btn = generateId(3, 7)
                result = createButton(btnName, options, btn)
            }
            tabMap[btnName] = { content, btn }
            contentContainer.add(content)
        }
        else { DisplayError('UniqueType', "uniqueTypeError", "tabName," + btnName) }
        return result
    }

    function createButton(btnName, option, id) {
        return leistrap.create(TAG_NAME,
            {
                text: option.buttonText || "leisButton",
                onclick: () => invoke(btnName),
                parent: buttonsContainer,
                data: { id },
                type: "button"
            }
        )
    }


    /**
     * call and show tab by its btnName
     * @param {string} btnName 
     */
    function invoke(btnName) {
        if (has(btnName, tabMap)) {
            loopObject(tabMap).forEach(item => {
                item.content.hide()
                item.content.removeClassName("active")
                if (item.btn) {
                    leistrap.get(item.btn, "removeClassName", "active")
                }
            })

            const current = tabMap[btnName]
            current.content.show()
            current.content.setClassName("active")
            event.invoke(btnName)
            if (current.btn) {
                leistrap.get(current.btn, "setClassName", "active")
            }
        }
    }
    /**
     * 
     * @param {keyof HTMLElementTagNameMap} tagName_ 
     * @returns void
     */
    const useElement = tagName_ => TAG_NAME = tagName_
    /**
     * removes a particular tab to the component
     * @param {string} TabName 
     */
    function remove(TabName) {
        if (has(TabName, tabMap)) {

            // destroy the tab content
            tabMap[TabName].content.destroy()
            if (tabMap[TabName]) {
                leistrap.get(tabMap[TabName].btn, "destroy")
                    .then(elem => delete tabMap[TabName])
            }
            else { delete tabMap[tabName] }
        }
    }
    /** destroy the tab component */
    function destroy() {
        // clear the tabMap object
        loopObject(tabMap, (value, key) => delete tabMap[key])
        // clear the TAB object 
        loopObject(TAB, (value, key) => delete TAB[key])
        buttonsContainer.destroy()
        contentContainer.destroy()
        event.clear()
        TAG_NAME = null
    }

    const TAB = {
        buttonsContainer,
        contentContainer,
        define,
        invoke,
        useElement,
        destroy,
        remove,
        event,
    }

    return TAB
}