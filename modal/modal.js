import { CloseBtn } from "../button/leisButton.js";
import { leistrap } from "../cors/leistrap.js";
import { leisButton } from "../button/leisButton.js";
import { _EventEmitter, has } from "../../utility/index.js";

leistrap.addCss(leisButton())

function leisModal(titleText) {
   const event =  _EventEmitter()
    const container = leistrap.create('div', {
        parent: "main",
        className: "leis-modal-container",
        onclick: function (e) {
            if (e.target == this._conf) hide()
        }
    })
    const dialog = leistrap.create("div", {
        parent: container,
        className: "leis-modal-dialog modal-transform",

    })
    const content = leistrap.create("div", {
        parent: dialog,
        className: "leis-modal-content"
    })

    const header = leistrap.create("div", {
        parent: content,
        className: "leis-modal-header"
    })
    const body = leistrap.create("div", {
        parent: content,
        className: "leis-modal-body"
    })
    const footer = leistrap.create("div", {
        parent: content,
        className: 'leis-modal-footer'
    })

    const title = leistrap.create("h3", {
        text: titleText,
        className: 'leis-modal-title',
        parent: header
    })
    const closeBtn = CloseBtn(header).addEvent("click", e => hide())


    const footerCard = leistrap.create("div", {
        parent: footer,
        className: 'leis-modal-footer-card',
        content: [
            leistrap.create('button', {
                type: "button",
                text: "Close",
                className: 'leis-btn leis-btn-secondary',
                onclick: e => hide()
            }),
            leistrap.create('button', {
                type: "button",
                text: "save data",
                className: 'leis-btn leis-btn-primary'
            })
        ]
    })


    function show() {
        container.setClassName("show")
        if(has("show", event.eventsList())){
            event.invoke('show')
        }
    }
    function hide() {
        container.removeClassName("show")
    }
    function setSize(width, height) {
        if (height) dialog.setStyleSheet({ height })
        if (width) dialog.setStyleSheet({ width })

    }
    const Modal = {
        container, dialog, content, header,
        body, footer, title, closeBtn, footerCard, setSize,
        show, hide, event
    }
    return Modal
}

export { leisModal }