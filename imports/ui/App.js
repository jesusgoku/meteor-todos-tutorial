import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

import { Tasks } from '../api/tasks';

import Task from './Task';
import AccountsUIWrapper from './AccountsUIWrapper';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hideCompleted: false,
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Meteor.call('tasks.insert', text);

        ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }

    getTasks() {
        return [
            { _id: 1, text: 'This is the task 1' },
            { _id: 2, text: 'This is the task 2' },
            { _id: 3, text: 'This is the task 3' },
        ];
    }

    renderTasks() {
        return this.props.tasks
            .filter(t => !this.state.hideCompleted || !t.checked)
            .map(t => {
                const currentUserId = this.props.currentUser && this.props.currentUser._id;
                const showPrivateButton = t.owner === currentUserId;
                return (
                    <Task key={t._id} task={t} showPrivateButton={showPrivateButton} />
                );
            })
        ;
    }
    
    toggleHideCompleted() {
        this.setState({
            hideCompleted: !this.state.hideCompleted,
        });
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List ({this.props.incompleteCount})</h1>

                    <label className="hide-complete">
                        <input type="checkbox" readOnly checked={this.state.hideCompleted} onClick={this.toggleHideCompleted.bind(this)}/>
                        Hide Completed Tasks
                    </label>

                    <AccountsUIWrapper />

                    {this.props.currentUser ? (
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                            <input type="text" ref="textInput" placeholder="Type to add new tasks"/>
                        </form>
                    ) : ''}
                    
                </header>

                <ul>{this.renderTasks()}</ul>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('tasks');

    return {
        tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
        incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
        currentUser: Meteor.user(),
    };
})(App);