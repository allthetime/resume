const pills = document.querySelectorAll('.skill-pill');

let isDragging = false;
let currentDraggable = null;
let dragClone = null;
let originalElement = null;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let animationFrame = null;
let longPressTimer = null;
let longPressActivated = false;

// Detect if device is mobile/touch-only
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

// Only attach listeners if not mobile
if (!isMobile) {
    // Mouse events
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mousemove', onDrag);

    // Touch events
    document.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchmove', onDrag, { passive: false });
}

function startDrag() {
    if (currentDraggable && (isDragging || longPressActivated)) {
        animationFrame = requestAnimationFrame(updateDragPosition);
    }
}

function endDrag() {
    // Clear long press timer if still waiting
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
    
    longPressActivated = false;
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
    
    if (isDragging && dragClone) {
        resetDraggedElement();
    }
}

function onDrag(e) {
    if (isDragging) {
        // Handle both mouse and touch events
        const touch = e.touches ? e.touches[0] : e;
        currentX = touch.pageX;
        currentY = touch.pageY;
        
        // Prevent scrolling on mobile when dragging
        if (e.touches) {
            e.preventDefault();
        }
    }
}

function updateDragPosition() {
    if (dragClone && isDragging) {
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        dragClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        checkIntersections();
    }
    
    if (isDragging) {
        animationFrame = requestAnimationFrame(updateDragPosition);
    }
}

function checkIntersections() {
    const dragRect = dragClone.getBoundingClientRect();
    let closestPill = null;
    let closestDistance = Infinity;
    
    pills.forEach(pill => {
        if (pill === originalElement) return;
        
        const pillRect = pill.getBoundingClientRect();
        
        // Check if dragged element overlaps with this pill
        if (isOverlapping(dragRect, pillRect)) {
            // Calculate center-to-center distance
            const distance = getDistance(dragRect, pillRect);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestPill = pill;
            }
        }
    });
    
    // Swap with the closest overlapping pill
    if (closestPill && closestPill !== originalElement.nextSibling && closestPill !== originalElement.previousSibling) {
        swapElements(originalElement, closestPill);
    }
}

function isOverlapping(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function getDistance(rect1, rect2) {
    const center1X = rect1.left + rect1.width / 2;
    const center1Y = rect1.top + rect1.height / 2;
    const center2X = rect2.left + rect2.width / 2;
    const center2Y = rect2.top + rect2.height / 2;
    
    return Math.sqrt(Math.pow(center2X - center1X, 2) + Math.pow(center2Y - center1Y, 2));
}

function swapElements(elem1, elem2) {
    const parent = elem1.parentNode;
    const next = elem1.nextSibling;
    
    if (next === elem2) {
        parent.insertBefore(elem2, elem1);
    } else {
        parent.insertBefore(elem1, elem2);
        if (next) {
            parent.insertBefore(elem2, next);
        } else {
            parent.appendChild(elem2);
        }
    }
}

function resetDraggedElement() {
    if (!dragClone || !originalElement) return;
    
    // Get final position to animate to
    const targetRect = originalElement.getBoundingClientRect();
    const cloneRect = dragClone.getBoundingClientRect();
    
    const finalX = targetRect.left - cloneRect.left + (currentX - startX);
    const finalY = targetRect.top - cloneRect.top + (currentY - startY);
    
    dragClone.classList.add('reset');
    dragClone.style.transform = `translate(${finalX}px, ${finalY}px)`;
    
    dragClone.addEventListener('transitionend', () => {
        if (dragClone && dragClone.parentNode) {
            dragClone.parentNode.removeChild(dragClone);
        }
        originalElement.style.opacity = 1;
        cleanup();
    }, { once: true });
}

function cleanup() {
    isDragging = false;
    currentDraggable = null;
    dragClone = null;
    originalElement = null;
    startX = 0;
    startY = 0;
    currentX = 0;
    currentY = 0;
}

class Draggable {
    constructor(element) {
        this.elem = element;
        // Only attach listeners if not mobile
        if (!isMobile) {
            this.attachListeners();
        }
    }

    handleStart = (e) => {
        const isTouch = e.type === 'touchstart';
        
        if (isTouch) {
            // For touch, start long press timer
            const touch = e.touches[0];
            const startPos = { x: touch.pageX, y: touch.pageY };
            
            longPressTimer = setTimeout(() => {
                // Check if finger hasn't moved much
                const currentTouch = e.touches && e.touches[0];
                if (currentTouch) {
                    const moved = Math.abs(currentTouch.pageX - startPos.x) + Math.abs(currentTouch.pageY - startPos.y);
                    if (moved < 10) {
                        longPressActivated = true;
                        this.activateDrag(touch.pageX, touch.pageY);
                        
                        // Visual/haptic feedback (if supported)
                        if (navigator.vibrate) {
                            navigator.vibrate(50);
                        }
                    }
                }
            }, 500); // 500ms long press
        } else {
            // For mouse, activate immediately
            e.preventDefault();
            this.activateDrag(e.pageX, e.pageY);
        }
    }

    activateDrag(pageX, pageY) {
        currentDraggable = this;
        isDragging = true;
        
        startX = pageX;
        startY = pageY;
        currentX = startX;
        currentY = startY;
        
        // Create clone for dragging
        const rect = this.elem.getBoundingClientRect();
        const clone = this.elem.cloneNode(true);
        
        clone.style.position = 'fixed';
        clone.style.top = `${rect.top}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '1000';
        clone.classList.remove('reset');
        clone.classList.add('dragging');
        
        document.body.appendChild(clone);
        
        // Hide original
        this.elem.style.opacity = '0.3';
        
        originalElement = this.elem;
        dragClone = clone;
    }

    attachListeners() {
        this.elem.addEventListener('mousedown', this.handleStart, false);
        this.elem.addEventListener('touchstart', this.handleStart, { passive: false });
    }
}

// Initialize draggable pills
Array.from(pills).forEach(pill => new Draggable(pill));

