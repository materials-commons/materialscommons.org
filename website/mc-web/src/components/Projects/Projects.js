import React from 'react';
import {Button} from 'semantic-ui-react';
import SearchProjects from './SearchProjects';
import ProjectList from './ProjectList';
import axios from 'axios';

export default class Projects extends React.Component {
    render() {
        return (
            <div className="ui grid">
                <div className="row">
                    <div className="ui container">
                        <Button floated="right" primary>create project</Button>
                    </div>
                </div>

                <div className="row centered">
                    <SearchProjects/>
                </div>

                <div className="row">
                    <h3>My Projects (2):</h3>
                    <ProjectList/>
                </div>

                <div className="row">
                    <h3>Projects I'm a member of (2):</h3>
                    <ProjectList/>
                </div>
            </div>
        )
    }
}
