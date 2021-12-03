const cc = document.getElementById('darkmode-selector');

let PRESSING = false;
let GLOBALx = 0;
let GLOBALy = 0;
let CURRENT_ELEM = null;
let CURRENT_START = null;
let ANIMATION;
let ANIMATION_COUNT = 0;

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

function drawCurrentElem() {
    if (CURRENT_ELEM && GLOBALx && GLOBALy) {
        const d = [
            1 - (CURRENT_ELEM.state.start_point[0] - GLOBALx),
            1 - (CURRENT_ELEM.state.start_point[1] - GLOBALy),
        ];
        CURRENT_ELEM.elem.style.transform = `translate(${d[0]}px,${d[1]}px)`
    }
}

// animateDraggable();


class Draggable {

    constructor(element) {
        this.state = {
            mousedown: false,
            start_point: null,
        }
        this.elem = element;
        this.attachListeners();
        // document.addEventListener('notPressing', () => {
        //     this.reset();
        // });
    }

    mousedown = (e) => {
        CURRENT_ELEM = this;
        this.elem.style.transform = `translate(0,0)`;
        this.state.mousedown = true;
        const { pageX: x, pageY: y } = e;
        this.state.start_point = [x, y];
        GLOBALx = x;
        GLOBALy = y;
        this.elem.classList.remove('reset');
    }

    reset = () => {
        this.state.mousedown = false;
        this.elem.classList.add('reset');
        CURRENT_ELEM = null;
    }

    attachListeners() {
        this.elem.addEventListener('mousedown', this.mousedown, false);
            // this.elem.addEventListener('mouseup', this.mouseup, false),
            // this.elem.addEventListener('mouseout', this.mouseup, false),
            // this.elem.addEventListener('mousemove', this.mousemove, false),
    }

}

const pills = document.querySelectorAll('.skill-pill');
Array.from(pills).forEach(pill => new Draggable(pill));

new Draggable(cc);


