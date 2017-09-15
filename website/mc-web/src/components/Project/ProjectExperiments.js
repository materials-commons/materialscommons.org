import React from 'react';
import {Form, Button, Card} from 'semantic-ui-react';
import moment from 'moment';
import {Link, withRouter} from 'react-router-dom';
import shortid from 'shortid';

export default class ProjectExperiments extends React.Component {
    render() {
        return (
            <div>
                <ExperimentControls/>
                <ExperimentCardsWithRouter experiments={this.props.experiments}/>
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

    onClick = (e) => () => this.handleClick(e);

    handleClick = (e) => console.log('Clicked', e);

    render() {
        console.log('ExperimentCards props', this.props);
        const params = this.props.match.params;
        const cards = this.props.experiments.map(e => (
            <Card fluid key={shortid.generate()}>
                <Card.Content onClick={this.onClick(e)}>
                    <Card.Header>
                        <Link to={`/projects/${params.project_id}/experiments/${e.id}`}>{e.name}</Link>
                    </Card.Header>
                    <Card.Meta>
                        Last Updated: {moment(e.mtime).format('DD/MM/YY')}
                    </Card.Meta>
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

const ExperimentCardsWithRouter = withRouter(ExperimentCards);