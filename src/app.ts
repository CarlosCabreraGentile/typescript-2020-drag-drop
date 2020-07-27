//Project Class
enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) { }
}

//Project State Management
type Listener = (projects: Project[]) => void;

class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    //With private constructor guarantee this is a singleton class
    //Singleton constructor
    private constructor() { }

    //If there is no Class instanciated, then create a new one
    static getInstance() {
        if (this.instance) {
            return this.instance
        } else {
            this.instance = new ProjectState();
            return this.instance;
        }
    }

    //call this method when something changes
    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numberOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numberOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            //send a copy of the original
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();

//Validation Inputs
interface Validatable {
    value: string | number;
    required?: boolean;
    minLengthString?: number;
    maxLengthString?: number;
    minLengthNumber?: number;
    maxLengthNumber?: Number;
}

function validate(input: Validatable) {
    let isValid = true;
    // is user type something and is bigger than 0
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0
    }
    if (input.minLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length > input.minLengthString;
    }
    if (input.maxLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length < input.maxLengthString;
    }
    if (input.minLengthNumber != null && typeof input.value === 'number') {
        isValid = isValid && input.value > input.minLengthNumber;
    }
    if (input.maxLengthNumber != null && typeof input.value === 'number') {
        isValid = isValid && input.value < input.maxLengthNumber;
    }
    return isValid;
}

//Autobind decorator
//Method Decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) { // _ dont use but you accept them 
    const originalMethod = descriptor.value; //name of method
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

//Project List Class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private statusProject: 'active' | 'finished') {
        /**
         * Selection
         */
        // this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;

        //Render the content
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];

        //extract the content of the node, the template
        const importedNode = document.importNode(this.templateElement.content, true);

        //From the node, extract specifically the section 
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.statusProject}-projects`;
        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.statusProject}-projects-list`)! as HTMLUListElement;
        for (const assignedProject of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = assignedProject.title;
            listEl.appendChild(listItem);
        }
    }

    //Heading of the section
    private renderContent() {
        const listId = `${this.statusProject}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.statusProject.toUpperCase() + ' PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }

}

//Project Input Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        /**
         * Selection
         */
        // this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;

        //Render the content
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        //extract the content of the node, the template
        const importedNode = document.importNode(this.templateElement.content, true);

        //From the node, extract specifically the form 
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

        this.configure();
        this.attach();
    }

    /**
     * Render the information
     */

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidate: Validatable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidate: Validatable = {
            value: enteredDescription,
            required: true,
            minLengthString: 2
        };
        const peopleValidate: Validatable = {
            value: +enteredPeople,
            required: true,
            minLengthNumber: 2,
            maxLengthNumber: 6
        };

        if (!validate(titleValidate) ||
            !validate(descriptionValidate) ||
            !validate(peopleValidate)) {
            alert('Invalid input');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        //Prevent trigger the http request
        event.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');