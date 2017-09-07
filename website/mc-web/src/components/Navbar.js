import React, {Component} from 'react';
import {Menu} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';

export default class Navbar extends Component {
    state = {};

    handleItemClick = (e, {name}) => this.setState({activeItem: name});

    render() {
        //const {activeItem} = this.state;

        return (
            <Menu fixed='top' inverted>
                <Menu.Item>
                    <div>
                        <div className="row">
                            <h3 className="mc-name center">MaterialsCommons</h3>
                        </div>
                        <hr style={{marginTop: '0', marginBottom: '0'}}/>
                        <div className="two column row">
                            <NavLink to="/projects" activeClassName="active" className="toggle-nav mc-subhead" style={{marginRight: '8px'}}>Projects</NavLink>
                            <NavLink to="/datasets" activeClassName="active" className="toggle-nav mc-subhead">Published Data</NavLink>
                        </div>
                    </div>
                </Menu.Item>
            </Menu>
        )
    }
}