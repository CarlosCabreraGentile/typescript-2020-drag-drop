//Component Base Class
export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T; // where are we going to render
    element: U; // the element to render

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string
    ) {
        //Selection
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        //Render the content
        this.hostElement = document.getElementById(hostElementId)! as T;

        //extract the content of the node, the template
        const importedNode = document.importNode(this.templateElement.content, true);
        //From the node, extract specifically the section 
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}