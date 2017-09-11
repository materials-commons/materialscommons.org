import React from 'react';
import SearchProjects from './SearchProjects';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import {getAllProjects} from '../../api/projectsAPI';
import Fuse from 'fuse.js';
import {Route, Switch, withRouter} from 'react-router-dom';
import Project from '../Project/Project';

class AllProjects extends React.Component {
    state = {
        projects: [],
        projectsSearch: ""
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
            (projects) => {
                this.fuseInstance = new Fuse(projects, this.fuseOptions);
                this.setState({projects: projects});
            }
        );
    }

    handleSearchChange = (searchTerm) => {
        this.setState({projectsSearch: searchTerm});
    };

    render() {
        const projectsToFilter = this.state.projectsSearch === "" ? this.state.projects : this.fuseInstance.search(this.state.projectsSearch);
        const myProjects = projectsToFilter.filter(p => p.owner === 'gtarcea@umich.edu');
        const otherProjects = projectsToFilter.filter(p => p.owner !== 'gtarcea@umich.edu');

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

// <Route path="/abc" render={()=><TestWidget num="2" someProp={100}/>}/>
// In render function we have the project_id so the project can be looked up and passed to the Project component
class Projects extends React.Component {
    componentDidMount() {
    }

    render() {
        console.log('this.props', this.props);
        return (
            <div>
                <Switch>
                    <Route exact path="/projects" component={AllProjects}/>
                    {/*<Route path="/projects/:project_id" component={Project}/>*/}
                    <Route path="/projects/:project_id" render={(props) => {console.log('render props', props); return <Project/>}}/>
                </Switch>
            </div>
        )
    }
}

const ProjectsWithRouter = withRouter(Projects);

export default ProjectsWithRouter;
