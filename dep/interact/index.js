import { leistrap } from "../../cors/leistrap.js"
import style from './style.css'
import Interact from "./interact.m.js"


/**
 * 
 * @param {leistrap.Leistrap<HTMLElement>} elem 
 */
function moveDrag(elem){
    
// draggable

let resize = true
const position = { x: 0, y: 0 }


elem.setClassName('resizable')

interact(elem._conf).draggable({
  // rhe axis control; // lock the drag to the starting direction
  //  startAxis: 'xy',
  // lockAxis: 'start',

  // only drag if the drag was started horizontally
//    startAxis: 'x',
//   lockAxis: 'x',
  listeners: {
    start (event) {
        resize = false
        event.target.classList.remove("resizable")
        event.type, event.target.classList.add("draggable")


    },
    end : (event) =>  {
        event.target.classList.remove("draggable")
        resize = true
        event.target.classList.add("resizable")
    },
    
    move (event) {
     if(!resize){
        position.x += event.dx
        position.y += event.dy
      
        event.target.style.transform =
          `translate(${position.x}px, ${position.y}px)`
     }
    },
  }
})

// resizable


interact(elem._conf)
  .resizable({
    edges: { top: true, left: true, bottom: true, right: true },
    // inverse the position
    invert : "reposition",
    
    // the modifier allow in transmform
    // modifiers: [
    //   interact.modifiers.aspectRatio({
    //     // make sure the width is always double the height
    //     ratio: 2,
    //     // also restrict the size by nesting another modifier
    //     modifiers: [
    //       interact.modifiers.restrictSize({ max: 'parent' }),
    //     ],
    //   }),
    // ],
    
    
    listeners: {
      move: function (event) {
       if(resize){
        let { x, y } = position

        x = (parseFloat(x) || 0) + event.deltaRect.left
        y = (parseFloat(y) || 0) + event.deltaRect.top

        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`,
          transform: `translate(${x}px, ${y}px)`
        })

        Object.assign(position, { x, y })
       }
      }
    }
  })

  // conrol cursor 
  // interact(elem).styleCursor(false)
}


leistrap.addCss(style)
document.body.append(leistrap.create("script",{
    text : Interact
}).render())


export {moveDrag}

  // drop zone

//   interact(".dropZone")
//   .dropzone({
//     // select the targets which will be dropped
//     // accept: '.drag0, .drag1',
//     // overlap: 0.25,
//     checker: function (
//       dragEvent,         // related dragmove or dragend
//       event,             // Touch, Pointer or Mouse Event
//       dropped,           // bool default checker result
//       dropzone,          // dropzone Interactable
//       dropzoneElement,   // dropzone element
//       draggable,         // draggable Interactable
//       draggableElement   // draggable element
//     ) {
  
//       // only allow drops into empty dropzone elements
//       // return dropped && !dropElement.hasChildNodes();
//       console.log("ok");
      
//     },
//     ondrop: function (event) {

//       alert(event.relatedTarget.className
//             + ' was dropped into '
//             + event.target.id)
//     }
//   })
//   .on('dropactivate', function (event) {
//     event.target.classList.add('drop-activated')
//   })