import React from 'react';
import {Menu, Button, Form} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';
import Navbar from "../Navbar";
import MCEditor from '../MCEditor/MCEditor';
import ProjectExperimentCards from './ProjectExperimentCards';

export default class Project extends React.Component {
    render() {
        console.log('Project props', this.props);
        const project = this.props.project;
        return (
            <div>
                <ProjectNavBar/>
                <div className="Main-Project">
                    <div className="Main-Content">
                        <div className="ui grid">
                            <div className="column five wide">
                                <ProjectName name={project.name}/>
                                <ProjectDescription description={project.description}/>
                                <ProjectReminders reminders={project.reminders}/>
                                <ProjectNote/>
                            </div>
                            <div className="column eleven wide">
                                <ProjectExperimentCards experiments={project.experiments}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ProjectNavBar extends React.Component {
    render() {
        return (
            <div style={{position: 'fixed', width: '100%'}}>
                <Navbar/>
                <Menu inverted className="blue"
                      style={{width: '100%', borderRadius: '0', marginTop: '0'}}>
                    <Menu.Item>
                        <NavLink to="/projects/:project_id" activeClassName="active"
                                 className="toggle-nav mc-subhead"
                                 style={{marginRight: '8px'}}>
                            Home
                        </NavLink>
                    </Menu.Item>
                    <Menu.Item>
                        <NavLink to="/projects/:project_id/samples" activeClassName="active"
                                 className="toggle-nav mc-subhead">
                            Samples
                        </NavLink>
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}

class ProjectName extends React.Component {
    render() {
        return (
            <div className="ui grid two column">
                <div className="column"><h3>{this.props.name}</h3></div>
                <div className="column"><Button primary>Rename</Button></div>
            </div>
        );
    }
}

const ProjectDescription = (props) => (
    <div className="ui grid one column">
        <Form className="marginTop10">
            <Form.Field>
                <label>Description</label>
                <textarea rows="3" value={props.description} placeholder="Add short project description..."></textarea>
            </Form.Field>
        </Form>
    </div>
);

const ProjectReminders = (props) => {
    const reminders = props.reminders.map(r => (
        <Form.Field>
            <textarea type="text" value={r.note} rows="1"/>
        </Form.Field>
    ));

    return (
        <div className="ui grid one column">
            <div className="column marginTop10">
                <div className="ui grid two column">
                    <span className="ui header tiny">Reminders</span>
                    <a className="uppercase"><i className="icon plus"></i>Add Reminder</a>
                </div>
                <Form className="marginTop10">
                    {reminders}
                </Form>
            </div>
        </div>
    )
};

const ProjectNote = (props) => {
    return (
        <div className="ui grid one column">
            <MCEditor/>
        </div>
    )
};