import { Project, ProjectStatus } from '../models/project.js'

type Listener<T> = (items: T[]) => void;

class State<T>{
    protected listeners: Listener<T>[] = [];

    //call this method when something changes
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

export class ProjectState extends State<Project> {

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
        this.updateListeners();
    }

    changeProjectStatus(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            //send a copy of the original
            listenerFn(this.projects.slice());
        }
    }

}

export const projectState = ProjectState.getInstance();