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
        return (this.state.isLoggedIn ? <UserMenu user={this.state.user.fullname} onLogout={this.handleLogout}/>
            // <Button onClick={this.handleLogout}>Logout ({this.state.user.fullname})</Button>
            : <UserLogin onSuccess={this.handleLogin}/>);
    }
}

const NavbarUserControlsWithRouter = withRouter(NavbarUserControls);

/*
<Menu attached='top'>
      <Dropdown item icon='wrench' simple>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Icon name='dropdown' />
            <span className='text'>New</span>

            <Dropdown.Menu>
              <Dropdown.Item>Document</Dropdown.Item>
              <Dropdown.Item>Image</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Item>
          <Dropdown.Item>Open</Dropdown.Item>
          <Dropdown.Item>Save...</Dropdown.Item>
          <Dropdown.Item>Edit Permissions</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Header>Export</Dropdown.Header>
          <Dropdown.Item>Share</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Menu.Menu position='right'>
        <div className='ui right aligned category search item'>
          <div className='ui transparent icon input'>
            <input className='prompt' type='text' placeholder='Search animals...' />
            <i className='search link icon' />
          </div>
          <div className='results' />
        </div>
      </Menu.Menu>
    </Menu>
    isAdmin && <Dropdown.Item>SWITCH TO USER</Dropdown.Item>
                isAdmin && <Dropdown.Divider/>
 */
class UserMenu extends React.Component {
    render() {
        const isAdmin = userAPI.user().admin;

        return (
            <Menu inverted>
                <Dropdown item simple text={this.props.user} className='uppercase'>
                    <Dropdown.Menu style={{right: '0', left: 'auto'}}>
                        <Dropdown.Item>ACCOUNT SETTINGS</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>TEMPLATE BUILDER</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>HELP</Dropdown.Item>
                        <Dropdown.Item>RELEASE NOTES</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item>BUILD DEMO PROJECT</Dropdown.Item>
                        <Dropdown.Divider/>
                        <Dropdown.Item onClick={this.props.onLogout}>LOGOUT</Dropdown.Item>
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
