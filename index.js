import {leistrap} from "./cors/leistrap.js"
import {leisAccordion} from "./accordion/accordion.js"
import { leisAlert } from "./alert/alert.js"
import {autoComplete} from "./autocomplete/autocomplete.js"
import {leisButton} from "./button/leisButton.js"
import {leisCard} from "./card/leisCard.js"
import {leisCollapse} from "./collpse/collapse.js"
import * as inputs  from "./input/leisInput"
import {leisModal} from "./modal/modal"
import { leisPage } from "./page/page.js"
import { DropUp } from "./popup/index.js"
import {leisMenu} from "./popup/menu.js"
import { leisTable } from "./table/table.js"
import { leisTab } from "./tabPage/tabPage.js"


(function(){

    const cp = {
        accordion : leisAccordion,
        alert : leisAlert,
        autoComplete : autoComplete,
        button : leisButton,
        card : leisCard,
        collapse : leisCollapse,
        input : inputs,
        modal : leisModal,
        page : leisPage,
        dropUp : DropUp,
        leisMenu : leisMenu,
        table : leisTable,
        tab : leisTab,
    }
    leistrap.cp = cp
    globalThis.ls = leistrap
})()

