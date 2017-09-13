import React from 'react';
import {Form, Button, Card} from 'semantic-ui-react';

export default class ProjectExperimentCards extends React.Component {
    render() {
        return (
            <div class="ui grid one column">
                <ExperimentControls/>
                <ExperimentCards experiments={this.props.experiments}/>
            </div>
        )
    }
}

class ExperimentControls extends React.Component {
    render() {
        const value = 'active';
        return (
            <Form>
                <Form.Group inline>
                    <Button primary style={{marginRight: '40px'}}>start new experiment</Button>
                    <Form.Radio label='ACTIVE EXPERIMENTS' value={value}
                                checked={value === 'active'}
                                onChange={this.handleChange}/>
                    <Form.Radio label='COMPLETED EXPERIMENTS' value={value} checked={value === 'done'}
                                onChange={this.handleChange}/>
                    <Form.Radio label='ON HOLD EXPERIMENTS' value={value} checked={value === 'on-hold'}
                                onChange={this.handleChange}/>
                </Form.Group>
            </Form>
        )
    }
}

class ExperimentCards extends React.Component {

    handleChange = () => null;

    render() {
        const cards = this.props.experiments.map(e => (
            <Card>
                <Card.Content>
                    <Card.Header>{e.name}</Card.Header>
                </Card.Content>
            </Card>
        ));
        return (
            <Card.Group>
                {cards}
            </Card.Group>
        )
    }
}