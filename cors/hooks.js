import { isFunction } from "../../utility/index.js"
const hooks = {

    // these hooks will be executed when an instance of leistrap is created
    useInit: [],
    // these hooks  will be executed when  we pass options to the new leistrap
    // instance just created
    useOption: [],
    // hooks which will be executed before an element rending
    useRender: [],
    /**
     * call a hook
     * @param { "useInit" |"useOption"|"useRender"} name 
     */
    callHook: function (name, DisplayError, ...argv) {
        this[name].forEach(hook => {
            if (isFunction(hook)) hook(...argv)
            else { DisplayError("LeisError", "listenerError", hook) }
        })
    }
}

export { hooks }

