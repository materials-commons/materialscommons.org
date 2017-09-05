import React, {Component} from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Projects from './components/Projects/Projects';

class App extends Component {
    render() {
        return (
            <div className="App2">
                <Navbar/>
                <div className="ui" style={{marginTop: '95px', marginLeft: '30px', marginRight: '30px'}}>
                    <Projects/>
                </div>
            </div>
        );
    }
}

export default App;
