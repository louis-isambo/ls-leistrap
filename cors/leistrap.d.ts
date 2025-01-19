import { _EventEmitter } from "../obj/event"


export declare namespace leistrap {

    type colors = "primary" | "secondary" | "info" | "dark" | "danger" | "light" | "success" | "warning"
    type leisSetting = {}
    type leisContent = {
        content: Array<Leistrap<HTMLElement>>,
        parent: Leistrap<HTMLElement>,
        text: string,
        data: { id: string }
        qutClick : boolean
    }
    type extensionResult = null
    type leisEvent = "destroy" | "render" | "add"
    type localData = {
        /**
         * this property allows to index an element and access the lase one by its `id` (localId).
         * 
         * 
         */
        id: string
    }
    interface hookOption {
        push: (listener: (element: Leistrap<HTMLElement>, option: leisOptions<HTMLElement>) => void) => void
    }
    interface hookInit {
        push: (listener: (element: Leistrap<HTMLElement>) => void) => void
    }
    interface hookRender {
        push: (listener: (element: Leistrap<HTMLElement>) => void) => void
    }
    type options = {
        linkName: string
        leis: string,

    }
    type elementProps = {
        prop: options
    }
    type leisOptions<Type> = Type | elementProps | leisContent


    interface leisHooks {
        useInit: hookInit
        useOption: hookOption,
        useRender: hookRender
    }

    interface Leistrap<type> {
        state: {
            visible: boolean,
            rendered: boolean,
            readonly : boolean
        }
        event: _EventEmitter
        _conf: type
        hide: () => this
        show: () => this
        add: (Element: this) => this | null
        setText: (value: string) => this
        content: leisContent["content"];
        parent: Leistrap<HTMLElement>,
        data: localData,
        destroy: () => this
        addElements: (elements: Array<Leistrap>) => this
        remove: (element: Leistrap | string) => this
        removeAll: () => this
        addEvent: (

            eventType: keyof WindowEventMap,
            listener: (this: Leistrap<HTMLElement>, e: Event) => void,
            eventName: string, options) => this
        removeEvent: (eventType: keyof WindowEventMap, eventName: string, option) => this
        setStyleSheet: (css: CSSStyleDeclaration) => this
        getText: () => string
        setClassName: (classNames: string) => this
        removeClassName: (className) => this
        toggleClassName: (className) => this
        replaceClassName: (className, newClassName: string) => this
        addAttr: (attrName: string | object, value: string) => this
        getAttr: (attrName: string | Array<string>) => string | object | null
        removeAttr: (attrName: string | Array<string>) => this
        once: (e: leisEvent, listener: (elem: this) => void, timeout?: number) => this

    }

    function create<Type extends keyof HTMLElementTagNameMap>
        (tagName: Type, option: leisOptions<HTMLElementTagNameMap[Type]>):
        Leistrap<HTMLElementTagNameMap[Type]>

    function whenReady(listener: (this: Leistrap<HTMLDivElement>) => void): void
    function render(id: "main"): void
    function defineExtension(extensionName: string,
        listener: (setting: leisSetting, ls: leistrap, hooks: leisHooks) => extensionResult
    )

    function addTo(parentId: string, child: Leistrap | string): void
    function get<m extends keyof Leistrap<HTMLElement>>(elementId: string, method: m, args): void

    function addCss(cssDeclaration: string): Leistrap<HTMLStyleElement> | null

    function hideWhenWinClick(listener: () => void): void
    const event = _EventEmitter
    const Colors = [""]
    const currentElement = leistrap.create("p")
}



