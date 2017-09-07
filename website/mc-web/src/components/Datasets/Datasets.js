import React from 'react';
import {getTopPublicDatasets} from '../../api/datasetsAPI';

//import Fuse from 'fuse.js';

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
            <div>Datasets here</div>
        )
    }
}
