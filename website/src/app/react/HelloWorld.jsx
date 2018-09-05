import React, {Component} from 'react';
import { react2angular } from 'react2angular';

class HelloWorld extends Component {
    render() {
        return (
            <div>Hello {this.props.name} from react</div>
        )
    }
}

angular.module('materialscommons').component('helloWorld', react2angular(HelloWorld, ['name']));