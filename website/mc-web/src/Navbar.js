import React, {Component} from 'react'
import {Menu, Divider} from 'semantic-ui-react'

export default class Navbar extends Component {
    state = {}

    handleItemClick = (e, {name}) => this.setState({activeItem: name})

    render() {
        const {activeItem} = this.state

        return (
            <Menu fixed='top' inverted2 stackable>
                <Menu.Item>
                    <div class="ui two column grid">
                        <div className="row">
                            <h1>MaterialsCommons</h1>
                        </div>
                        <hr/>
                        <div className="row">
                            <span className="column" style={{marginRight: '8px'}}>Projects</span>
                            <span className="column">Published Data</span>
                        </div>
                    </div>
                </Menu.Item>

                <Menu.Item
                    name='features'
                    active={activeItem === 'features'}
                    onClick={this.handleItemClick}
                >
                    Features
                </Menu.Item>

                <Menu.Item
                    name='testimonials'
                    active={activeItem === 'testimonials'}
                    onClick={this.handleItemClick}
                >
                    Testimonials
                </Menu.Item>

                <Menu.Item
                    name='sign-in'
                    active={activeItem === 'sign-in'}
                    onClick={this.handleItemClick}
                >
                    Sign-in
                </Menu.Item>
            </Menu>
        )
    }
}