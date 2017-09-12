import React from 'react';
import {Menu} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';
import Navbar from "../Navbar";

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

export default class Project extends React.Component {
    render() {
        console.log('Project props', this.props);
        return (
            <div>
                <ProjectNavBar/>
                <div className="Main-Project">
                    <div className="Main-Content">
                        Project {this.props.project.id}
                    </div>
                </div>
            </div>
        );
    }
}