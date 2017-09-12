import React from 'react';
import {getTopPublicDatasets} from '../../api/datasetsAPI';
import Navbar from "../Navbar";

//import Fuse from 'fuse.js';

const FixedNavbar = (props) => (
    <div style={{position: 'fixed', width: '100%'}}>
        <Navbar/>
    </div>
);

export default class Datasets extends React.Component {
    state = {
        datasets: [],
        datasetsSearch: ""
    };

    componentDidMount() {
        getTopPublicDatasets().then(
            (datasets) => this.setState({datasets: datasets})
        );
    }

    render() {
        return (
            <div>
                <FixedNavbar/>
                <div className="Main">
                    <div className="Main-Content">
                        Datasets here
                    </div>
                </div>
            </div>
        )
    }
}
