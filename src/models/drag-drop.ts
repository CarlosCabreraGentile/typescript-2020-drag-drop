export interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
    //to signal the browser and javascript 
    //that the thing you are dragging something over is valid drag target
    dragOverHandler(event: DragEvent): void;

    //to react to the actual drop 
    dropHandler(event: DragEvent): void;

    //to give some visual feedback when user drag something
    dragLeaveHandler(event: DragEvent): void;

}