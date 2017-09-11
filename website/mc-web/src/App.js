import React, {Component} from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Projects from './components/Projects/Projects';
import Datasets from './components/Datasets/Datasets';

import {HashRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Navbar/>
                    <div className="ui App-Main">
                        <Switch>
                            <Route path="/projects" component={Projects}/>
                            <Route path="/datasets" component={Datasets}/>
                            <Redirect to="/datasets"/>
                        </Switch>
                    </div>
                </div>
            </Router>
        );
    }
}

export default App;
