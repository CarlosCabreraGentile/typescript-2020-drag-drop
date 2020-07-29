import { Component } from './base-components';
import { autobind } from '../decorators/autobind';
import { Project, ProjectStatus } from '../models/project'
import { DragTarget } from '../models/drag-drop';
import { projectState } from '../state/project-state'
import { ProjectItem } from './project-item';

export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private statusProject: 'active' | 'finished') {
        super('project-list', 'app', false, `${statusProject}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    //place where frop the item
    @autobind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @autobind
    dropHandler(event: DragEvent): void {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.changeProjectStatus(
            projectId,
            this.statusProject === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    //handle when leave the element
    @autobind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }

    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

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