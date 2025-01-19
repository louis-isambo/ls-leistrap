
import { Draggable } from "./draggable.js";

import resizeCss from "./css/resizable.css"
import { leistrap } from "../cors/leistrap.js";

leistrap.addCss(resizeCss)
/**
 * 
 * @param {HTMLElement} element 
 * @param {HTMLElement} child
 */
function Resizable(element, child, padding = 0) {

  const handleTop = document.createElement("div")
  handleTop.className = "resize-handle top"

  const handleLeft = document.createElement("div")
  handleLeft.className = "resize-handle left"

  const handleRight = document.createElement("div")
  handleRight.className = "resize-handle right"

  const handleBottom = document.createElement("div")
  handleBottom.className = "resize-handle bottom"

  //cor,ers handle

  const cornerTopLeft = document.createElement("div")
  cornerTopLeft.className = "resize-corner top-left"

  const cornerTopRight = document.createElement("div")
  cornerTopRight.className = "resize-corner top-right"

  const cornerBottomLeft = document.createElement("div")
  cornerBottomLeft.className = "resize-corner bottom-left"

  const cornerBottomRight = document.createElement("div")
  cornerBottomRight.className = "resize-corner bottom-right"

  const edges = [handleTop, handleLeft, handleRight, handleBottom,
    cornerTopLeft, cornerTopRight, cornerBottomLeft, cornerBottomRight]
  edges.forEach(function (edge) {
    element.append(edge)
  })

  // resizing


  Resize(handleTop, ResizeTop)
  Resize(handleRight, ResizeRight)
  Resize(handleBottom, ResizeBottom)
  Resize(handleLeft, ResizeLeft)

  // corner handl
  Resize(cornerTopLeft, function (option) {
    ResizeTop(option)
    ResizeLeft(option)
  })

  Resize(cornerTopRight, function (option) {
    ResizeTop(option)
    ResizeRight(option)
  })

  Resize(cornerBottomLeft, function (option) {
    ResizeBottom(option)
    ResizeLeft(option)
  })

  Resize(cornerBottomRight, function (option) {
    ResizeBottom(option)
    ResizeRight(option)
  })



  function ResizeTop(option) {
    let newHeight = option.targetBind.height - (option.event.clientY - option.initialMouseY);
    element.style.height = newHeight + 'px';
    element.style.top = option.targetBind.y + (option.event.clientY - option.initialMouseY) + 'px';
    checkChild("height", newHeight)
  }

  function ResizeLeft(option) {
    let newWidth = option.targetBind.width - (option.event.clientX - option.initialMouseX);
    element.style.width = newWidth + 'px';
    element.style.left = option.targetBind.x + (option.event.clientX - option.initialMouseX) + 'px';
    checkChild("width", newWidth)
  }

  function ResizeRight(option) {
    let newWidth = option.targetBind.width + (option.event.clientX - option.initialMouseX);
    element.style.width = newWidth + 'px';
    checkChild("width", newWidth)
  }

  function ResizeBottom(option) {
    let newHeight = option.targetBind.height + (option.event.clientY - option.initialMouseY);
    element.style.height = newHeight + 'px';
    checkChild("height", newHeight)

  }

  function checkChild(prop, value) {
    if (child) {

      if (prop == "height") child.style.height = `${value - padding}px`
      else {
        child.style.width = `${value - padding}px`
      }
    }

  }
  function Resize(edge, callback) {
    Draggable(edge, {
      init: function () { element.resizable = true },
      preventDefault: true,
      targetBind: element,
      move: function (option) {
        callback(option)
      }
    })

  }
  Draggable(element, { autoDragging: true })
}

export { Resizable }