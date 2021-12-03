const pills = document.querySelectorAll('.skill-pill');


let PRESSING = false;
let GLOBALx = 0;
let GLOBALy = 0;
let CURRENT_ELEM = null;
let ORIGINAL_ELEM = null;
let CURRENT_START = null;
let ANIMATION;
let ANIMATION_COUNT = 0;
let xDiff;

document.onmousedown = () => {
    animateDraggable();
    PRESSING = true;
}

document.onmouseup = () => {
    cancelAnimationFrame(ANIMATION);
    ANIMATION_COUNT += 1;
    if (PRESSING && CURRENT_ELEM) {
        PRESSING = false;
        CURRENT_ELEM.reset();
        xDiff = 0;
    }
}

document.onmousemove = (e) => {
    if (PRESSING && CURRENT_ELEM && CURRENT_ELEM.state.start_point) {
        const { pageX: x, pageY: y } = e;
        GLOBALx = x;
        GLOBALy = y;
    }
}

function animateDraggable() {
    drawCurrentElem();
    ANIMATION = requestAnimationFrame(animateDraggable);
}

// function swapElements(obj1, obj2) {
//     // create marker element and insert it where obj1 is
//     var temp = document.createElement("div");
//     obj1.parentNode.insertBefore(temp, obj1);
//     // move obj1 to right before obj2
//     obj2.parentNode.insertBefore(obj1, obj2);
//     // move obj2 to right before where obj1 used to be
//     temp.parentNode.insertBefore(obj2, temp);
//     // remove temporary marker node
//     temp.parentNode.removeChild(temp);
//     SWAP_ELEMENT = null;
// }
const swapElements = function (nodeA, nodeB) {
    // SWAP_ELEMENT = null;
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};

// function swapElements(obj1, obj2) {
//     // save the location of obj2
//     var parent2 = obj2.parentNode;
//     var next2 = obj2.nextSibling;
//     // special case for obj1 is the next sibling of obj2
//     if (next2 === obj1) {
//         // just put obj1 before obj2
//         parent2.insertBefore(obj1, obj2);
//     } else {
//         // insert obj2 right before obj1
//         obj1.parentNode.insertBefore(obj2, obj1);

//         // now insert obj1 where obj2 was
//         if (next2) {
//             // if there was an element after obj2, then insert obj1 right before that
//             parent2.insertBefore(obj1, next2);
//         } else {
//             // otherwise, just append as last child
//             parent2.appendChild(obj1);
//         }
//     }
//     SWAP_ELEMENT = null;
// }


let SWAP_ELEMENT;

const activeIntersections = {

}

function drawCurrentElem() {

    if (CURRENT_ELEM && GLOBALx && GLOBALy) {
        const d = [
            1 - (CURRENT_ELEM.state.start_point[0] - GLOBALx),
            1 - (CURRENT_ELEM.state.start_point[1] - GLOBALy),
        ];

        // console.log(xDiff);

        // if (xDiff) d[0] = d[0] - xDiff;

        CURRENT_ELEM.elem.style.transform = `translate(${d[0]}px,${d[1]}px)`

        Array.from(pills).forEach(pill=>{

            let target = pill.getBoundingClientRect();
            let elem = CURRENT_ELEM.elem.getBoundingClientRect();

            if (pill.innerText == CURRENT_ELEM.elem.innerText) return undefined;
            
            activeIntersections[pill.innerText] = false;

            if(target.top + target.height > elem.top
                && target.left + target.width > elem.left
                && target.bottom - target.height < elem.bottom
                && target.right - target.width < elem.right) 
            {
                activeIntersections[pill.innerText] = true;

                if (!SWAP_ELEMENT) {
                    SWAP_ELEMENT = pill;
                    // xDiff = target.x - elem.x;
                    // swapElements(CURRENT_ELEM.elem, pill);
                    swapElements(ORIGINAL_ELEM, pill);
                }
                // if (SWAP_ELEMENT && pill != SWAP_ELEMENT && !activeIntersections[SWAP_ELEMENT.innerText]) {
                // if (SWAP_ELEMENT && pill != SWAP_ELEMENT) {
                //     SWAP_ELEMENT = pill;
                //     swapElements(pill, ORIGINAL_ELEM);
                // }
            }
        });
    }

}

// animateDraggable();
const boundaries = {};

class Draggable {

    constructor(element) { 
        const name = element.innerText;
        console.log(name);
        this.state = {
            mousedown: false,
            start_point: null,
        }
        this.elem = element;
        this.attachListeners();
        // document.addEventListener('notPressing', () => {
        //     this.reset();
        // });

        const bounding = element.getBoundingClientRect();

            // const d = document.createElement('div');
            // d.style.top = offsetTop + offsetHeight;
            // d.style.left = offsetLeft;
            // d.style.height = 10;
            // d.style.width = 10;
            // d.id = 'nasty';
            // document.body.appendChild(d);



        
    }

    mousedown = (e) => {
        CURRENT_ELEM = this;
        // this.elem.style.transform = `translate(0,0)`;
        this.state.mousedown = true;
        const { pageX: x, pageY: y } = e;
        this.state.start_point = [x, y];
        GLOBALx = x;
        GLOBALy = y;


        const MAGIC = 4;

        this.elem.classList.remove('reset');
        const parent = this.elem.parentNode;
        const clone = this.elem.cloneNode(true);
        const b = this.elem.getBoundingClientRect();
        clone.style.position = 'fixed';
        clone.style.top = b.top - MAGIC;
        clone.style.left = b.left - MAGIC;
        this.elem.style.opacity = 0;
        parent.appendChild(clone);
        ORIGINAL_ELEM = this.elem;
                SWAP_ELEMENT = null;
        CURRENT_ELEM.elem = clone;
    }


    reset = () => {
        this.state.mousedown = false;
        // CURRENT_ELEM.elem.style.opacity = 0;

        CURRENT_ELEM.elem.classList.add('reset');



        if (SWAP_ELEMENT) {
            const SWAP_BOUNDING = SWAP_ELEMENT.getBoundingClientRect();
            const GET_BACK_TO = ORIGINAL_ELEM.getBoundingClientRect();
            const right = GET_BACK_TO.right - SWAP_BOUNDING.right;
            const left = GET_BACK_TO.left - SWAP_BOUNDING.left;
            const top = GET_BACK_TO.top - SWAP_BOUNDING.top;
            const bottom = GET_BACK_TO.bottom - SWAP_BOUNDING.bottom;

            const directons = {
                right: right > 0,
                left: right < 0,
                up: bottom < 0,
                down: bottom > 0,
            }
        

            let xD;
            // let yD;

            const TARGET_IS_SMALL = GET_BACK_TO.width < SWAP_BOUNDING.width;

            if (directons.right) {
                xD = left;
                // if (directons.down) xD = right;
            } 
            
            if (directons.left) {
                xD = right;
                if (directons.down) xD = left;
                // if (directons.up) xD = left;
            }

            // if (directons.up) {
            //     if (TARGET_IS_SMALL) {
            //         if (directons.right) {
            //             xD = right;
            //             alert('YEAH')
            //         }
            //     } else {

            //     }
            // }

            // const xD = (right < 0) ? right : left;
            let yD = bottom < 0 ? bottom : top;


            CURRENT_ELEM.elem.style.transform = `translate(${xD}px,${yD}px)`
        } else {
            CURRENT_ELEM.elem.style.transform = `translate(0,0)`
        }

        CURRENT_ELEM.elem.ontransitionend = ()=>{
            CURRENT_ELEM.elem.parentNode.removeChild(CURRENT_ELEM.elem)
            // ORIGINAL_ELEM.classList.add('reset');
            ORIGINAL_ELEM.style.opacity = 1;
            this.elem = ORIGINAL_ELEM;
            CURRENT_ELEM = null;
            ORIGINAL_ELEM = null;
            SWAP_ELEMENT = null;
        }

    }

    attachListeners() {
        this.elem.addEventListener('mousedown', this.mousedown, false);
            // this.elem.addEventListener('mouseup', this.mouseup, false),
            // this.elem.addEventListener('mouseout', this.mouseup, false),
            // this.elem.addEventListener('mousemove', this.mousemove, false),
    }

}

Array.from(pills).forEach(pill => new Draggable(pill));

