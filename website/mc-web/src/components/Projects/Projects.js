import React from 'react';
import SearchProjects from './SearchProjects';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import {getAllProjects} from '../../api/projectsAPI';
import Fuse from 'fuse.js';
import {Route, Switch, withRouter} from 'react-router-dom';
import Project from '../Project/Project';
import _ from 'lodash';
import {Dimmer, Loader} from 'semantic-ui-react';
import Navbar from "../Navbar";

const FixedNavbar = (props) => (
    <div style={{position: 'fixed', width: '100%'}}>
        <Navbar/>
    </div>
);

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
        this.fuseInstance = new Fuse(this.props.projects, this.fuseOptions);
    }

    handleSearchChange = (searchTerm) => {
        this.setState({projectsSearch: searchTerm});
    };

    render() {
        const projectsToFilter = this.state.projectsSearch === "" ? this.props.projects : this.fuseInstance.search(this.state.projectsSearch);
        const myProjects = projectsToFilter.filter(p => p.owner === 'gtarcea@umich.edu');
        const otherProjects = projectsToFilter.filter(p => p.owner !== 'gtarcea@umich.edu');

        return (
            <div>
                <FixedNavbar/>
                <div className="Main">
                    <div className="Main-Content">
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
                    </div>
                </div>
            </div>
        )
    }
}

class Projects extends React.Component {
    state = {
        projects: [],
        loaded: false
    };

    componentDidMount() {
        getAllProjects().then(
            (projects) => {
                this.setState({projects: projects, loaded: true});
            }
        );
    }

    findProject = (projectId) => {
        return _.find(this.state.projects, {id: projectId});
    };

    render() {
        if (!this.state.loaded) {
            return (
                <Dimmer active={true}>
                    <Loader/>
                </Dimmer>
            )
        }

        return (
            <Switch>
                <Route exact path="/projects" render={() => <AllProjects projects={this.state.projects}/>}/>
                <Route path="/projects/:project_id"
                       render={(props) => <Project project={this.findProject(props.match.params.project_id)}/>}/>
            </Switch>
        )
    }
}

const ProjectsWithRouter = withRouter(Projects);

export default ProjectsWithRouter;
