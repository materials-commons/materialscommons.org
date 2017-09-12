import React from 'react';

export default class Project extends React.Component {
    render() {
        console.log('Project props', this.props);
        const project = this.props.project;
        return (<div>Project {project.id}</div>);
    }
}