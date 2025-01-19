import { leistrap } from "../cors/leistrap.js"
import { arrayRemove, has, isEmpty, loopObject } from "../../utility/index.js"
import { DisplayError } from "../Errors/leisError.js"


export function leisPage(parent) {


    const home = leistrap.create("div", { data: { id: "home" } })
    const pageMap = { home }
    let history = []
    let currentPageName = "home"
    const container = leistrap.create("div", {
        className: "leis-mainPage",
        parent,
        content: [home]
    })

    const btn = leistrap.create("button",
        {
            type: "button",
            className: "leis-btn-controler hide",
            parent: container
        }).addEvent("click", function () {
            history.pop()
            if (isEmpty(history)) {
                loopObject(pageMap).forEach(item => item.setStyleSheet("display : none"))
                home.setStyleSheet("display : block")
                this.setClassName("hide")
                PAGE.current = home
            }
            else {
                invoke(history[history.length - 1])
            }
        })


    /**
     * create a new page 
     * @param {string} pageName  pane  id
     * @param {leistrap.Leistrap<HTMLElement>} contentPage  the content 
     * to show once the pageName is called
     */
    function define(pageName, contentPage) {

        if (!has(pageName, pageMap)) {
            const content = leistrap.create("div", {
                content: [contentPage],
                parent: container,
                className: "leis-page-content"
            })
            pageMap[pageName] = content


        }
        else { DisplayError("UniqueType", "uniqueTypeError", "pageName," + pageName) }
    }


    function invoke(pageName) {
        if (has(pageName, pageMap)) {
            loopObject(pageMap).forEach(item => item.setStyleSheet("display : none"))
            pageMap[pageName].setStyleSheet("display : block")
            PAGE.current = pageMap[pageName]
            if (!has(pageName, history)) history.push(pageName)
            btn.removeClassName("hide")
            currentPageName = pageName
        }
    }

    function remove(pageName) {
        if (has(pageName, pageMap)) {
            pageMap[pageName].destroy()
            delete pageMap[pageName]
            if (has(pageName, history)) {
                arrayRemove(history.indexOf(pageName) - 1, history)
                if (currentPageName == pageName) btn._conf.click()
            }
        }
    }

    function destroy() {
        history = null
        loopObject(pageMap, (value, key) => delete pageMap[key])
        loopObject(PAGE, (value, key) => delete PAGE[key])
        container.destroy()

    }
    const PAGE = {
        current: home,
        define,
        invoke,
        home,
        btn,
        remove,
        destroy
    }

    return PAGE
}