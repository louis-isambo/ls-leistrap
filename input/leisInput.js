import { leistrap } from "../cors/leistrap.js";
import inputCss from "./input.css"
import { generateId, has, isFunction, isString, loopObject } from "../../utility/index.js"

leistrap.addCss(inputCss)

/**
 * this, is for radio btn n switchbox, checkbox inputs
 * @param {string} label  the text to show next to the inputs
 * @param {()=> void} onActive  the active listener
 * @param {()=>void} onDisable  the disable listener
 */
function ActiveAndDisableInputType(type, inputClass, cdClass, parent, label, onActive, onDisable) {

    let event_ = setActiveANdDisableEvent(onActive, onDisable)

    const input = leistrap.create('input',
        { type, className: inputClass })


    const inputLabel = leistrap.create("label",
        { text: label }).addAttr("for", input.key)


    const container = leistrap.create("div",
        {
            parent, className: cdClass,
            content: [inputLabel, input]
        })


    // add listeners onActive and onDisable events
    input.addEvent('click', function (e) {
        if (e.target.checked) {
            event_.eventMap.active.forEach(item => item.call(input))
        }
        else { event_.eventMap.disable.forEach(item => item.call(input)) }
    })

    // destroying the component

    function destroy() {
        container.removeAll()
        container.destroy()
        loopObject(INPUT, function (value, key) {
            delete INPUT[key]
        })
    }
    const INPUT = {
        container,
        label: inputLabel,
        input,
        on: event_.on,
        destroy
    }

    INPUT.render = () => container.render()
    return INPUT
}



// control the active ans disable event listeners
function setActiveANdDisableEvent(onActive, onDisable) {

    // switchBox events
    const eventMap = { active: [], disable: [] }

    if (onActive) isFunction(onActive) ? eventMap.active.push(onActive) : null
    if (onDisable) isFunction(onDisable) ? eventMap.disable.push(onDisable) : null
    /**
  * 
  * @param {"active"|"disable"} eventType  event type
  * @param {()=>void} listener  event listner
  */
    function on(eventType, listener) {
        if (isString(eventType) && isFunction(listener)) {
            if (has(eventType, eventMap)) eventMap[eventType].push(listener)
        }
    }
    return { on, eventMap }


}


/**
 * leistrap switchBox component
 * @param {string} label  the text to show next to the inputs
 * @param {()=> void} onActive  the active listener
 * @param {()=>void} onDisable  the disable listener
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 */
function switchBox(parent, label, onActive, onDisable) {
    return ActiveAndDisableInputType(
        "checkbox",
        "leis-switchboxtBtn",
        "leis-switchboxBtns-card",
        parent,
        label,
        onActive,
        onDisable

    )
}


/**
 * leistrap checkBox component
 * @param {string} label  the text to show next to the inputs
 * @param {()=> void} onActive  the active listener
 * @param {()=>void} onDisable  the disable listener
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 */
function checkBox(parent, label, onActive, onDisable) {
    return ActiveAndDisableInputType(
        "checkbox",
        "leis-checkboxtBtn",
        "leis-checkboxBtns-card",
        parent,
        label,
        onActive,
        onDisable
    )
}


/**
 * leistrap buttonRadio component
 * @param {string} label  the text to show next to the inputs
 * @param {()=> void} onActive  the active listener
 * @param {()=>void} onDisable  the disable listener
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 */
function btnRadio(parent, label, onActive, onDisable) {
    return ActiveAndDisableInputType(
        "radio",
        "leis-radioBtn",
        "leis-radioBtns-card",
        parent,
        label,
        onActive,
        onDisable
    )
}


// leistrap text Type inputs
function setTextInputType(type, inputClass, cdClass, parent, label, textArea) {
    const container = leistrap.create("div", { parent, className: cdClass })
    const labelText = leistrap.create("label", { text: label, parent: container })
    const input = leistrap.create(textArea ?  "textarea" :"input",
        { parent: container }).setClassName(inputClass)

    if(!textArea) input.addAttr({type})
    labelText.addAttr('for', input.key)

    // destroying the component
    function destroy() {
        container.removeAll()
        container.destroy()
        loopObject(TEXT, function (value, key) {
            delete TEXT[key]
        })
    }
    const TEXT = {
        label: labelText,
        container,
        input,
        destroy
    }

    return TEXT
}

/**
 *  leistrap textBix component
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 * @param {string} label 
 */
function textBox(parent, label) {
    return setTextInputType(
        "text",
        "leis-textinput",
        "leis-textbox-card",
        parent,
        label
    )
}

/**
 *  leistrap textBix component
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 * @param {string} label 
 */
function leisTextArea(parent, label) {
    return setTextInputType(
        "text",
        "leis-textinput",
        "leis-textbox-card",
        parent,
        label,
        true
    )
}

/**
 *  leistrap password component
 * @param {leistrap.Leistrap<HTMLInputElement>} parent 
 * @param {string} label 
 */
function passwordBox(parent, label) {
    return setTextInputType(
        "password",
        "leis-textinput",
        "leis-textbox-card",
        parent,
        label)
}
export { switchBox, checkBox, btnRadio, passwordBox, textBox, leisTextArea }