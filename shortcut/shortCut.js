import { has, inverseObject, isEmpty ,_EventEmitter} from "../../utility/index.js"


function shortCut(element, objLeis) {
    
    // create event emitter to handle a given combination of 
    // key or characters
    const event_ = _EventEmitter()

    //object to save all keydown keyCode
    let shortcuts = {}

    // the counter variable is for sorting the keys save into the shortcuts object
    //in order asc
    let counter = 0
    
    // listening to key key and get this one
    element.addEventListener("keydown", function (e) {
        // checkKey(e)
    
        if (!has(e.key.toLowerCase(), shortcuts)) {
            shortcuts[e.key.toLowerCase()] = counter++      
        }
        getResult(e)
    })

    function checkKey(e){
       let keyCode = e.keyCode
        if((keyCode != 17 && keyCode != 16
            && keyCode != 9 && keyCode != 27
            && keyCode != 18
        ) && (!e.ctrlKey && !e.altKey)) shortcuts = {}
    }

    function getResult(e){
        const invers = inverseObject(shortcuts)
        let result = Object.keys(invers)
        let len = result.length
        result = result.sort().map(item => invers[item]).join("")
  
        
        if (has(result, event_.eventsList()) && len <= 3 ) {
              e.preventDefault()
            event_.invoke(result, null, e)

        }
    }



    //remove the key released
    element.addEventListener("keyup", function (e) {
        // e.preventDefault()

        // if the shortcut has 4 or more characters
        //call the shortcut handle
        if(Object.keys(shortcuts).length >= 4 ) getResult(e)
      
        delete shortcuts[e.key.toLowerCase()]
        if (isEmpty(shortcuts)) {
            counter = 0
        }
    })

    // empty the shortcuts object 
    element.addEventListener("blur", function (e) {
       shortcuts = {}
    })

    
     function bind (token, listener) {
        const tokenTyped = keyMap(token)
        event_.handle(tokenTyped.result, (evt, evtKey) => {
            listener(evtKey)
        })
    }
    function  reShortcut (token) {
        const short = keyMap(token).result
        event_.removeEvent(short)
    }

    element.bind = bind
    element.reShortcut = reShortcut
    if(objLeis) {
        objLeis.bind = bind
        objLeis.reShortcut = reShortcut
    }
}




function keyMap(keys) {
    let keyTyped = keys.replace(/ /gi, "").split("+")
        .map(item => {
            if (isEmpty(item)) return "+"
            else { return item }

        })
    const maps = {
        "tab": "tab",
        "ctrl": "control",
        "control": "control",
        "cmd": "command",
        "escape": "escape",
        "esc": "escape",
        "capslock": "capslock",
        "shift": "shift",
        "alt": "alt",
        "enter": "enter",
        "contextmenu": "contextmenu",
        "backspace": " ",
        "arrowup": "arrowup",
        "arrowdown": "arrowdown",
        "arrowleft": "arrowleft",
        "arrowright": "arrowright"
    }

    keyTyped = keyTyped.map(item => {
        item = item.toLowerCase()
        if (maps[item]) return maps[item]
        else { return item }

    })

    return {
        result: keyTyped.join("").replace("++", '+'),
        length: keyTyped.length
    }

}



export {shortCut}