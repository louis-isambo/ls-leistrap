import COLORIS from "./coloris.m.js"
import colorisCss from "./coloris.css"
import { leistrap } from "../../cors/leistrap.js"


leistrap.addCss(colorisCss)
document.body.append(leistrap.create("script", { text: COLORIS }).render())

const ColorisPicker = function (listener) {
   Coloris.setInstance(`.color-picker`, {
        inline: true,
        theme: 'polaroid',
        themeMode: 'light',
        alpha: true,
        formatToggle: true,
        onChange: listener
    });

    //close colorPicker

    leistrap.event.handle("colorPicker:close", function(){
        Coloris.close();
    })
}



export { ColorisPicker }
