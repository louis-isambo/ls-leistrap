
import { leistrap } from "../cors/leistrap.js";
import cardCss from "./card.css"
import { loopObject } from "../../utility/index.js"

export function leisCard(cardParent, cardTitle, cardImg, cardContent = []) {
    leistrap.addCss(cardCss)

    /** the main card parent */
    const card = leistrap.create("div",
        { className: "leis-card" })


    /*** leisCard header */
    const header = leistrap.create('div', { className: "leis-card-header", parent: card })

    /** the imfTop  container */
    const imgTop = leistrap.create("div",
        { parent: card, className: "leis-img-card leis-card-img-top" }).hide()
    const imgT = leistrap.create("img", { parent: imgTop, className: 'leis-img' })

    /** les card body */
    const body = leistrap.create("div", { className: "leis-card-body", parent: card })
    const title = leistrap.create("h3", { text: "Card title", parent: body, className: 'leis-card-title' })
    body.addElements(...cardContent)

    const imgBottom = leistrap.create("div",
        { parent: card, className: "leis-img-card leis-card-img-bottom" }).hide()
    const imgB = leistrap.create("img", { parent: imgBottom, className: 'leis-img' })

    /** leis card footer */
    const footer = leistrap.create("div", { parent: card, className: "leis-card-footer" })

    const container = leistrap.create("div", { content: [card], parent: cardParent })
    /**
     * set the height and wisth of the card 
     */
    function setSize(width = "auto", height = "auto") {
        card.setStyleSheet({ width, height })
    }

    function destroy() {
        container.destroy();

        loopObject(Card_, function (value, key) {
            delete Card_[key]
        })
    }

    function setImg(position = "top", src) {
        if (position.toLowerCase() == "top") {
            imgBottom.hide()
            imgTop.show()
            imgT.addAttr({ src })
            return 0
        }
        imgTop.hide()
        imgBottom.show()
        imgB.addAttr({ src })
    }

    const Card_ = {
        card,
        footer,
        header,
        body,
        setSize,
        container,
        imgTop,
        imgBottom,
        imgB,
        imgT,
        title,
        destroy,
        setImg
    }
    if (cardImg) Card_.setImg("top", cardImg)
    if (cardTitle) title.setText(cardTitle)
    Card_.render = () => container.render()


    return Card_
}   