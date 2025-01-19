import { copyObject, isArray, isObject, isString, loopObject } from "../../utility/index.js";


export function SetOptions(element, options, getObjectByIndexName) {
    if (!options.data) options.data = {}

    // get all eventType , all properties which begin with on
    const exp = ["data", "text", "content", "parent", "id", "autoClick"]
    loopObject(copyObject(options, false, false, ...exp), function (value, key) {
        if (key.startsWith("on") && typeof value == "function") {
            // split the key for getting the eventName and options passed
            let eventType = key.slice(2, key.length).split("$")
            element.addEvent(eventType[0], value, eventType[1], eventType[2])
        }
        else {
            // now let assign all html properties not method
            // let begin we the string type, for example id, className etc...
            if (typeof element._conf[key] != "function") {
                element._conf[key] = value
            }
            
            //call a native function
            else{
                if(typeof value == "object"){
                    if(isArray(value)) element._conf[key](...value)
                }
                else {element._conf[key](value)}
            }
            // get all css styles definition an other html properties require object as value
            if (isObject(value)) {
                loopObject(value, (v, k) => element._conf[key][k] = v)
            }
        }
    })
    // const copyOptions = copyObject(options, false, false, '')
    if (options.content) {
        element.content = options.content;
        options.content.forEach((item, index) => item.parent = element)
    }

    if (options.parent) {
        if (isString(options.parent)) {
            const r = getObjectByIndexName(options.parent,
                true, parent => parent.add(element))
        }
        else { options.parent.add(element) }
    }

    if (options.text) element.setText(options.text)

    if (options.data.id) element.data.id = options.data.id
    if(options.autoClick) element._conf.click()

    // clear all options  and save space
    setTimeout(() => {
        loopObject(options, function (value, key, i, end) {
            try {
                delete options[key]
            } catch (error) {
            }

        })
    }, 2000)

}   