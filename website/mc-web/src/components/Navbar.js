import React from 'react';
import {Menu, Button, Modal, Header, Grid, Form, Segment, Message, Dropdown} from 'semantic-ui-react';
import {NavLink, withRouter} from 'react-router-dom';
import * as userAPI from '../api/userAPI';

export default class Navbar extends React.Component {
    render() {
        return (
            <Menu fixed='top' inverted>
                <Menu.Item>
                    <div>
                        <div className="row">
                            <h3 className="mc-name center">MaterialsCommons</h3>
                        </div>
                        <hr style={{marginTop: '0', marginBottom: '0'}}/>
                        <div className="two column row">
                            <NavLink to="/projects" activeClassName="active" className="toggle-nav mc-subhead"
                                     style={{marginRight: '8px'}}>
                                Projects
                            </NavLink>
                            <NavLink to="/datasets" activeClassName="active" className="toggle-nav mc-subhead">
                                Published Data
                            </NavLink>
                        </div>
                    </div>
                </Menu.Item>
                <Menu.Item position='right'>
                    <NavbarUserControlsWithRouter/>
                </Menu.Item>
            </Menu>
        )
    }
}

class NavbarUserControls extends React.Component {
    state = {
        isLoggedIn: false,
        user: null
    };

    handleLogin = () => this.setState({isLoggedIn: true, user: userAPI.user()});

    componentDidMount() {
        if (userAPI.isAuthenticated()) {
            this.setState({isLoggedIn: true, user: userAPI.user()});
        } else {
            this.props.history.push("/");
        }
    }

    handleLogout = () => {
        userAPI.logout();
        this.setState({isLoggedIn: false, user: null});
        this.props.history.push("/");
    };

    render() {
        if (this.state.isLoggedIn) {
            return (<UserMenu user={this.state.user.fullname} onLogout={this.handleLogout}/>);
        }
        return (<UserLogin onSuccess={this.handleLogin}/>);
    }
}

const NavbarUserControlsWithRouter = withRouter(NavbarUserControls);

class UserMenu extends React.Component {
    render() {
        const isAdmin = userAPI.user().admin;

        return (
            <Menu inverted>
                <Dropdown item text={this.props.user} className="uppercase-menu">
                    <Dropdown.Menu style={{right: '0', left: 'auto'}}>
                        {isAdmin && <Dropdown.Item>switch to user</Dropdown.Item>}
                        {isAdmin && <Dropdown.Divider/>}
                        <Dropdown.Item>account settings</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>template builder</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>help</Dropdown.Item>
                        <Dropdown.Item>release notes</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>build demo project</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item onClick={this.props.onLogout}>logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </Menu>
        )
    }
}

class UserLogin extends React.Component {
    state = {
        email: '',
        password: '',
        inError: false
    };

    handleEmail = (e) => {
        this.setState({email: e.target.value});
    };

    handlePassword = (e) => {
        this.setState({password: e.target.value});
    };

    handleLogin = (e) => {
        e.preventDefault();
        userAPI.login(this.state.email, this.state.password)
            .then(
                () => this.props.onSuccess()
            )
            .catch(
                () => this.setState({inError: true})
            );
    };

    render() {
        return (
            <Modal trigger={<Button className="ui basic" primary>Login/Register</Button>}>
                <Modal.Content>
                    <Grid
                        textAlign='center'
                        style={{height: '100%'}}
                        verticalAlign='middle'>
                        <Grid.Column style={{maxWidth: 450}}>
                            <Header as='h2' color='blue' textAlign='center'>
                                {' '}Login to your account
                            </Header>
                            <Form size='large' onSubmit={this.handleLogin} error={this.state.inError}>
                                <Segment stacked>
                                    <Form.Input
                                        fluid
                                        value={this.state.email}
                                        icon='user'
                                        iconPosition='left'
                                        onChange={this.handleEmail}
                                        placeholder='E-mail address'/>
                                    <Form.Input
                                        fluid
                                        value={this.state.password}
                                        icon='lock'
                                        iconPosition='left'
                                        placeholder='Password'
                                        onChange={this.handlePassword}
                                        type='password'/>
                                    <Button primary fluid size='large' type='submit'>Login</Button>
                                </Segment>
                                <Message error>Unknown or incorrect email/password</Message>
                            </Form>
                            <Message>
                                Not a member? <a href='#'>Join now</a>
                            </Message>
                            <Message>
                                Forgot your password? <a href='#'>Reset it</a>
                            </Message>
                            <Message>
                                Find out whats new by reading our <a href='#'>Release notes</a>
                            </Message>
                        </Grid.Column>
                    </Grid>
                </Modal.Content>
            </Modal>
        )
    }
}
