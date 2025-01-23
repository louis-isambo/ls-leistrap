import { DisplayError } from "../Errors/leisError.js";
import { copyObject, _EventEmitter, event, generateId, has, rangeList, isArray, isEmpty, isFunction, isObject, isString, isTypeOf, leisCode, loopObject } from "../../utility/index.js"
import { Render } from "./render.js"
import { hooks } from "./hooks.js";

import { SetOptions } from "./options.js";
import leistrapCss from "./css/leistrap.css"

const leistrap = (function () {

    // checks if the document is created before to execute any code
    let state = false

    // all extensions 
    let extensionMap = {}

    // all leistrap configurations
    let setting = {}

    //elements to hide when the window is click
    let hideWin = []

    // the main leistrap  event channels
    const mainEvent = _EventEmitter()
    const indexedElementEvent = _EventEmitter()
    // contains all leistrap object 
    let leisElementMap = {}

    class BaseElement {
        constructor(element) {
            /*** @type {HTMLLinkElement}*/
            this._conf = element

            // the unique leistrap object key
            this.key = generateId(5, 10)

            // contains all children
            /**@type{Array<BaseElement>}*/
            this.content = []
            this.contentMap = {}
            /**
             * thes element state
             * @type {{
             * rendered : boolean, 
             * }}
             */
            this.state = {visible: true}
            /**@type {BaseElement} */
            this.parent = null
            this.eventMap = {}
            /** the local data  */
            this.data = {
                indexName: null,
                element: this,
                get id() { return this.indexName },
                set id(value) {
                    indexedElementEvent.handle(value, e => e.send(this.element), true, false)
                        .then(() => this.indexName = value)
                }
            }
            // the object eventEmiter interface
            this.event = _EventEmitter()
            this.eventListeners = {}

            //handle all event 
            this.once = function (e, listener) {
                if (!has(e, this.eventListeners)) this.eventListeners[e] = []
                this.eventListeners[e].push(listener)
                return this
            }
            // associate the leistrap object to the htmlElement
            this._conf.currentElement = this

            // call all useInit Hooks and pass the this as parameter
            hooks.callHook("useInit", DisplayError, this)

        }


        render() {

            if (!this.state.rendered) {
                // render all children
                this.content.forEach(child => {
                    if (child.parent.key === this.key) {
                        this.contentMap[child.key] = child
                        this._conf.append(child.render())
                    }

                })


                //  execute all  useRender hoos
                hooks.callHook("useRender", DisplayError, this)

                // set the object key as id to the element 
                this._conf.id = this.key
                this.state.rendered = true

                // call all render eventListeners
                handleAllEvent("render", this.eventListeners, this)
           
                
            }

            return this._conf
        }

        /**
         * 
         * @param {BaseElement} element 
         * @returns this
         */
        add(elementObject) {
            let element = getObjectByIndexName(elementObject, true, (e) => this.add(e))
            handleAllEvent("add", this.eventListeners, this, 10, element)
            if (isTypeOf(element, BaseElement)) {
                element.parent = this
                this.contentMap[element.key] = element
                this._conf.append(element.render())
                this.content.push(element)
                return this
            }
            return this
        }

        // destroy the leistrap object and remove the element from the DOM
        destroy() {
            setTimeout(() => {

                // call all destroy events listeners
                handleAllEvent("destroy", this.eventListeners, this)

                // check if the object has a indexedElementEvent channel and then
                // remove this channel from the indexedElementEvent object 
                if (this.data.id) indexedElementEvent.removeEvent(this.data.id)

                // remove the object from leisElementMap object 
                delete leisElementMap[this.key]

                // remove the leistrap object from the parent object
                if (has(this.key, this.parent.contentMap)) {
                    delete this.parent.contentMap[this.key]
                    this.parent.content = loopObject(this.parent.contentMap)

                    // remove the object from the DOM
                    this.parent._conf.removeChild(this._conf)

                    // clear the object and save memory
                    setTimeout(() => {
                        loopObject(this, (value, key) => { delete this[key] })
                    }, 1000)
                }
            }, 100)
            return this
        }

        /**
         * allows to remove a child object
         * @param {BaseElement} element 
         */
        remove(element) {
            if (isString(element)) {
                getObjectByIndexName(element, true, child => child.destroy())
            }
            else { element.destroy() }
            return this
        }

        removeAll(listener) {
            setTimeout(() => {
                let counter = 0
                let len = this.content.length
                let allElem = loopObject(this.contentMap)
                let timer = setInterval(() => {
                    allElem[counter++].destroy()
                    if (counter === len){
                        if(listener) listener()
                        clearInterval(timer)
                    }
                }, 100);
            }, 100)
            return this
        }
        addElements(...elements) {
            let counter = 0
            let timer = setInterval(() => {
                this.add(elements[counter++])
                if (counter === elements.length) clearInterval(timer)
            }, 100);

            return this
        }

        /**
         * 
         * @param {keyof WindowEventMap} eventType 
         * @param  {(e : Event)=> void} listener 
         * @param { string} eventName 
         * @param {*} options 
         */
        addEvent(eventType, listener, eventName, options) {

            const element = this
            if (typeof listener === "function") {

                const copyListener = listener

                function callback(target) {
                    // the target.currentElement represents the leistrap object 
                    // associated to the html target
                    copyListener.call(element, target);
                    // call any hooks here to fire and catch all events passed to
                    // an element ......
                }

                // verify iff the eventType already exists in the eventMap object
                if (!this.eventMap[eventType]) { this.eventMap[eventType] = {} }

                // set a id to listener if the eventName is not set we generate an auto id
                // and save it into the eventMap[eventType] object 
                if (!eventName) eventName = !isEmpty(listener.name) ? listener.name : generateId(3, 8)

                // the event listener id must be unique, let verify the eventName 
                if (has(eventName, this.eventMap[eventType]))
                    DisplayError("UniqueType", "uniqueTypeError", "listenerName," + eventName)

                // now let save the listener in to the eventMap[eventType] object
                // this will helps to automatically remove a given eventType lister 
                this.eventMap[eventType][eventName] = callback

                // finally, add an eventListener to the element
                this._conf.addEventListener(eventType, callback, options)


            }
            return this
        }

        removeEvent(eventType, eventName, options) {
            if (!isEmpty(eventType) && !isEmpty(eventName) && this.eventMap[eventType]) {
                if (this.eventMap[eventType][eventName]) {
                    this._conf.removeEventListener(eventType,
                        this.eventMap[eventType][eventName], options
                    )
                    delete this.eventMap[eventType][eventName]
                }
            }
            return this
        }

        setStyleSheet(cssDefinition) {
            if (isString(cssDefinition)) this._conf.style = cssDefinition;
            if (isObject(cssDefinition)) loopObject(cssDefinition, (value, key) => {
                this._conf.style[key] = value
            })
            return this
        }

        setText(value) { this._conf.innerText = value; return this }
        getText() { return this._conf.textContent || this._conf.innerText }
        setClassName(classNames) {
            accessClassList(classNames, this._conf, "add")
            return this
        }
        removeClassName(classNames) {
            accessClassList(classNames, this._conf, "remove")
            return this
        }
        toggleClassName(classNames) {
            accessClassList(classNames, this._conf, "toggle")
            return this
        }
        replaceClassName(classNames, newClassNames) {
            accessClassList(classNames, this._conf, "replace", newClassNames)
            return this
        }
        addAttr(attrName, value) {
            if (isString(attrName) && isString(value)) {
                this._conf.setAttribute(attrName, value)
            }
            else if (isObject(attrName)) {
                loopObject(attrName, (value, key) => this._conf.setAttribute(key, value))
            }
            return this
        }

        getAttr(attrName) {
            if (isString(attrName)) return this._conf.getAttribute(attrName)

            if (isArray(attrName)) {
                const result = {}
                attrName.forEach(item => result[item] = this._conf.getAttribute(item))
                return result
            }
            return null
        }

        removeAttr(attrName) {
            if (isString(attrName)) this._conf.removeAttribute(attrName)
            if (isArray(attrName)) {
                attrName.forEach(item => this._conf.removeAttribute(item))
            }
            return this
        }
        hide() { this.addAttr('hidden', "true"); return this }
        show() { this.removeAttr('hidden') }
    }

    // this function creates an htmlElement and you can  
    // pass some properties by the option parameter
    function create(TagName, options = {}) {
        const element = new BaseElement(document.createElement(TagName))
        SetOptions(element, options, getObjectByIndexName)
        hooks.callHook("useOption", DisplayError, element, options)
        leisElementMap[element.key] = element
        setTimeout(() => options = null, 4000)
        return element

    }

    // the main parent!
    const main = new BaseElement(document.createElement("div"))
    main.data.id = "main"

    const win = new BaseElement(document.createElement("div"))
    win._conf = window

    // set the default style
    document.head.append(
        new BaseElement(document.createElement("style")).setText(leistrapCss).render()
    )

    // executes and create our app once the DOM is loaded
    function whenReady(listener) {
        if (isFunction(listener)) {
            listener.call(main)
        }
        else { DisplayError("LeisError", "listenerError", listener) }

        state = true
    }

    // indicate the HtmlElement's entry point of the application
    // defines where all elements will be added
    async function render(id) {
        setTimeout(function () {
            if (state) Render(document.getElementById(id), main)
            else { DisplayError("LeisProcessNotReady", "processNotReady") }
        }, 500)
    }

    /**
     *  this function allows the definition of the extension 
     * note : the extension name must be unique otherwise an error will be thrown
     * the functionalities (hooks) tat an extension can access :
     *  1. setting : access all settings passed 
     *  2. leistrap : access the leistrap object
     *  3. hooks : access and add the new functionality which will added into the 
     *      the hook chosen
     */

    function defineExtension(extensionName, listener) {
        if (isFunction(listener)) {
            executeExtension(extensionName, listener)
        }
        else { DisplayError("LeisError", "listenerError", listener) }

    }
    function executeExtension(extensionName, listener) {
        if (!has(extensionName, extensionMap)) {
            const extensionResult = listener(setting, leistrap, hooks)
            if (extensionResult) leistrap[extensionName] = extensionResult
            extensionMap[extensionName] = extensionName
        }
        else { DisplayError("UniqueType", "uniqueTypeError", "extensionName," + extensionName) }
    }

    // allows to get the object indexed via the data.id property
    function getObjectByIndexName(indexName, waitFor, clb) {
        if (isString(indexName) && waitFor) {
            indexedElementEvent.invoke(indexName, clb)
        }
        return indexName
    }

    // adds an element to other by using localId syntax
    function addTo(parentId, child) {
        if (isString(parentId)) {
            getObjectByIndexName(parentId, true, function (parentElement) {
                parentElement.add(child)
            })
        }
    }

    // find a leistrap object and apply some methods to it
    function getElement(name, method, ...args) {
        return new Promise(function (resolve, reject) {
            getObjectByIndexName(name, true, element => {
                if (typeof element[method] == "function")
                    element[method](...args)
                resolve(element)
            })
        })
    }

    function accessClassList(classNames, element, method, tokes) {
        if (tokes && method == "replace") {
            tokes = tokes.trim().split(String.fromCharCode(32))
            classNames.trim().split(String.fromCharCode(32))
                .forEach((item, index) => {
                    if (!isEmpty(item) && tokes[index])
                        element.classList.replace(item, tokes[index])
                })
        }
        else {
            if (isString(classNames)) classNames.trim().split(String.fromCharCode(32))
                .forEach((item, index) => { if (!isEmpty(item)) element.classList[method](item) })
        }
        return this
    }

    function addCss(cssDeclaration, force) {
        if (cssDeclaration || force) {
            const style = create("style", { text: cssDeclaration })
            document.head.append(style.render())
            return style
        }
        return null
    }
    function leistrap(configurations = copyObject(setting)) {
        setting = configurations
    }

    function handleAllEvent(eventName, evObject, element, timeout, ...argv) {
        if (has(eventName, evObject)) {
            evObject[eventName].forEach(item => {
                if (timeout) setTimeout(item, timeout, element, ...argv)
                else { item(element, ...argv) }
            })
        }
    }

    leistrap.main = main
    leistrap.win = win
    leistrap.event = mainEvent
    leistrap.create = create;
    leistrap.whenReady = whenReady;
    leistrap.render = render
    leistrap.defineExtension = defineExtension
    leistrap.event.handle("main", (e) => e.send(main))
    leistrap.addTo = addTo
    leistrap.get = getElement
    leistrap.addCss = addCss
    leistrap.hideWhenWinClick = function (element) { hideWin.push(element) }
    leistrap.lorem = "    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Culpa dolor aliquid quibusdam. Optio mollitia fugit nulla culpa, provident placeat unde iure eveniet earum nam, laborum hic autem? Rem, tenetur odio!"
    leistrap.Colors = ["primary", "secondary", "info", "dark", "danger", "light", "success", "warning"]
    leistrap.MLorem = function (num) { return rangeList(num).map(function (item) { return leistrap.lorem }).join(' ') }
    // init all default extensions, functionalities

    // hide all elements inside the hideWin Array

    window.addEventListener('click', function (event) {
        hideWin.forEach(item => item(event))
    })
    leistrap.map = leisElementMap
  
    return leistrap
})()



export { leistrap }