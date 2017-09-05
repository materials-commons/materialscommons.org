import React, {Component} from 'react';
import {Menu} from 'semantic-ui-react';

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
                            <h3>MaterialsCommons</h3>
                        </div>
                        <hr/>
                        <div className="row">
                            <span className="column" style={{marginRight: '8px'}}>Projects</span>
                            <span className="column">Published Data</span>
                        </div>
                    </div>
                </Menu.Item>
            </Menu>
        )
    }
}