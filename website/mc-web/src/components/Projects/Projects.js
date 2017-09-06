import React from 'react';
import SearchProjects from './SearchProjects';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import getAllProjects from '../../api/projectsAPI';
import Fuse from 'fuse.js';

export default class Projects extends React.Component {
    state = {
        projects: [],
        projectSearch: ""
    };

    fuseOptions = {
        shouldSort: true,
        threshold: 0,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: [
            "description",
            "name",
            "owner_details.fullname",
            "owner",
            "experiments.name",
            "experiments.description",
            "experiments.note",
            "owner",
            "reminders.note",
            "processes.name",
            "processes.template_name",
            "samples.name",
            "users.details.fullname",
            "users.user"
        ]
    };

    componentDidMount() {
        getAllProjects().then(
            (projects) => this.setState({projects: projects}),
            () => console.log('Failed to retrieve projects')
        );
    }

    handleSearchChange = (searchTerm) => {
        this.setState({projectSearch: searchTerm});
    };

    render() {
        let myProjects = this.state.projects.filter(p => p.owner === 'gtarcea@umich.edu');
        let otherProjects = this.state.projects.filter(p => p.owner !== 'gtarcea@umich.edu');
        if (this.state.projectSearch !== "") {
            const myFuse = new Fuse(myProjects, this.fuseOptions);
            const otherFuse = new Fuse(otherProjects, this.fuseOptions);
            myProjects = myFuse.search(this.state.projectSearch);
            otherProjects = otherFuse.search(this.state.projectSearch);
        }

        return (
            <div className="ui grid">
                <div className="four column row">
                    <div className="right floated column">
                        <CreateProject/>
                    </div>
                </div>

                <div className="row centered">
                    <SearchProjects onChange={this.handleSearchChange}/>
                </div>

                <div className="row">
                    <h3>My Projects ({myProjects.length}):</h3>
                    <ProjectList projects={myProjects}/>
                </div>

                <div className="row">
                    <h3>Projects I'm a member of ({otherProjects.length}):</h3>
                    <ProjectList projects={otherProjects}/>
                </div>
            </div>
        )
    }
}
