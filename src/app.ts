//Project Class
enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }
}

//Project State Management
type Listener<T> = (items: T[]) => void;

class State<T>{
    protected listeners: Listener<T>[] = [];

    //call this method when something changes
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {

    private projects: Project[] = [];
    private static instance: ProjectState;

    //With private constructor guarantee this is a singleton class
    //Singleton constructor
    private constructor() {
        super();
    }

    //If there is no Class instanciated, then create a new one
    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
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
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length > input.minLengthString;
    }
    if (input.maxLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length < input.maxLengthString;
    }
    if (input.minLengthNumber != null && typeof input.value === 'number') {
        isValid = isValid && input.value >= input.minLengthNumber;
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
    };
    return adjDescriptor;
}

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

//Project Item Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        } else {
            return `${this.project.people} persons`;
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    configure() { }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

//Project List Class
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects: Project[];

    constructor(private statusProject: 'active' | 'finished') {
        super('project-list', 'app', false, `${statusProject}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.statusProject === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    //Heading of the section
    renderContent() {
        const listId = `${this.statusProject}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.statusProject.toUpperCase() + ' PROJECTS';
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.statusProject}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const assignedProject of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, assignedProject);
        }
    }
}

//Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() { }

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
            minLengthNumber: 1,
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

}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');