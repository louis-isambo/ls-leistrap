import { leistrap } from "../cors/leistrap.js"
import collaCss from "./collapse.css"

leistrap.addCss(collaCss)

/**
 * 
 * @param {leistrap.Leistrap<HTMLElement>} parent 
 * @param {string} btnText
 * @param {Array<leistrap.Leistrap<HTMLElement>>} items 
 */
function leisCollapse(parent, btnText, items) {

  const paddings = {
    btn: 40, item: 50, arrow: 20
  }

  let card = leistrap.create("div", { className: "colla-cd" })


  const arrow = leistrap.create("button", {
    type: "button",
    className: "arrow",
  })

  let button = leistrap.create("div", {
    className: "collaBtn cd",
    text: btnText,
    content: [arrow]
  })

  const line = leistrap.create("div", {
    className: "colla-line"
  })

  const container = leistrap.create("div", {
    data: { type: "collapse" },
    content: [button, card, line],
    parent: parent,
    className: "colla-container",
    onclick: function (e) {
      if (this.child) e.stopPropagation()
      button.toggleClassName("clicked")
      card.toggleClassName("clicked")

    }
  })
  container.type = "collapse"
  card.padding = paddings

  card.once("add", function (e, element) {
    if (element.type == "collapse") {
      element.child = true

      element.content[0].setStyleSheet({ padding: `6px ${e.padding.item}px` })
      element.content[1].padding.btn = e.padding.item
      element.content[1].padding.item = e.padding.item + 10
      element.content[1].padding.arrow = e.padding.arrow + 10

      element.content[1].content.forEach(item => {

        if (item.type != "collapse")
          item.setStyleSheet({ padding: `6px ${e.padding.item + 10}px` })
      })

      element.content[0].content[0].setStyleSheet({ left: (e.padding.arrow + 10).toString() + "px" })
      element.content[2].setStyleSheet({ left: (e.padding.arrow + 5).toString() + "px" })


    }
  })

  items.forEach(item => {
    card.add(item)
    item.setClassName("colla-item")
    item.addEvent("click", e => e.stopPropagation())
  })


  const COLLA = { container, card, button }
  return COLLA


}

export { leisCollapse }