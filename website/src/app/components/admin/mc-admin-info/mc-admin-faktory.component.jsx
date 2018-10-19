import React, {Component} from 'react';
import { react2angular } from 'react2angular';

class AdminFactoryComponent extends Component {
    componentDidMount() {
        console.log("AdminFactoryComponent.componentDidMount()");
        axios.get('/api/etl/faktory/status').then(
            status => {
                console.log('faktory_status', status);
                this.setState({faktory_status: status});
            }
        );
    }

    render() {
        return (
            <div>Hello; status is {this.state.faktory_status.faktory.total_queues} from react</div>
        )
    }
}

angular.module('materialscommons').component('mc-admin-faktory', react2angular(AdminFactoryComponent, [/* args to component */]));
