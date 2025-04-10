import { leistrap } from "../cors/leistrap.js";
import { rangeList } from "../../utility/index.js";
import tableCss from "./style.css"

leistrap.addCss(tableCss)

function leisTable(parent, col = 3, row = 3, hd=[]) {

    const container = leistrap.create("div", { parent, className: "leis-table-container" })

    const table = leistrap.create("table", { parent: container, className: "leis-table" })
    const header = leistrap.create("thead", { parent: table, className: "leis-table-head" })
    const body = leistrap.create("tbody", { parent: table, className: "leis-table-head" })

    // init the table headings  nd columns count
    rangeList(col).forEach((item, i) => {
        const th = leistrap.create('th', { parent: header, className: "leis-table-heading", text: hd[i] || "heading" })
    })

    // init the table rows and data
    const rows = __addRow__(row, col)

    function __addRow__(rowNumber = 1, col, data=[]) {
        /**
         * @type {Array<leistrap.Leistrap<HTMLTableRowElement>>}
         */
        const matrix = []
        rangeList(rowNumber).forEach((item, i) => {
            //adding rows
            const tr = leistrap.create('tr', { parent: body, className: "leis-table-row" })
            matrix.push(tr)
            // adding table data for each table row
            // !note that  the number of the table data refers to the number of columns
            rangeList(col).forEach((item, j) => {
                let text = data[i] ? data[i][j] : null
                leistrap.create('td', { parent: tr, className: "leis-table-data", text: text || "data" })
            })
        })

        return matrix
    }

    function addRow(rowNumber,data ) {
        return __addRow__(rowNumber, header.content.length, data)
    }

    function addColumn(col = 1) {
        // for adding a new column into a give table we have to loop through the 
        // table rows and add a new table data foreach tr

        /**
         * @type{Array<leistrap.Leistrap<HTMLTableCellElement>>}
         */
        const TDS = []
        //todo add a new heading
        rangeList(col).forEach(item => {
            let th = leistrap.create('th', {
                parent: header,
                className: "leis-table-heading", text: "heading"
            })

            TDS.push(th)
            //todo add table data foreach tr
            body.content.forEach(tr => {
                const td = leistrap.create("td", { parent: tr, className: "leis-table-data", text: "data" })
                TDS.push(td)
            })
        })

        return TDS
    }


    function getRow(row) {
        if (row || row === 0) return body.content[row]
    }

    function getColumn(col) {
        if (col | col === 0) {
            let th = header.content[col]
            let TDS = th ? [th] : []
            body.content.forEach((item) => {
                if (item.content[col]) TDS.push(item.content[col])
            })
            return TDS
        }
    }
    /**
     * @param {number} col
     * @param {number} row
     * @return {leistrap.Leistrap<HTMLTableCellElement>} 
     */
    function getCell(col, row) {
        if ((col && row) || (col === 0 || row === 0)) {
            if (body.content[row] && header.content[col])
                return body.content[row].content[col]
        }
    }
    const TABLE = {
        rows, addRow, addColumn, getRow, getRow, getColumn, getCell,
        body, header, container, table
    }

    return TABLE

}

export { leisTable }