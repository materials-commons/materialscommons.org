import React, {Component} from 'react';
import './App.css';
import Projects from './components/Projects/Projects';
import Datasets from './components/Datasets/Datasets';

import {HashRouter as Router, Redirect, Route, Switch} from 'react-router-dom';

class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <Switch>
                        <Route path="/projects" component={Projects}/>
                        <Route path="/datasets" component={Datasets}/>
                        <Redirect to="/datasets"/>
                    </Switch>
                </div>
            </Router>
        );
    }
}

export default App;
