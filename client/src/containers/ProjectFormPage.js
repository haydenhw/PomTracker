import  React, { Component } from 'react';
import PropTypes from 'prop-types';
import shortid from 'shortid';

import ProjectForm from '../components/ProjectForm';

export default class ProjectFormPage extends Component {
  
  
  handleFormSubmit = (values) => {
    console.log(values)
  }
  
  addTask = (evt) => {
    evt.preventDefault();
    console.log(evt.nativeEvent.target);
  }
  
  renderFormTask (task) {
    const { taskName } = task;
     
    return (
      <div className="form-task-list-item" key={shortid.generate()}>
        <span>{taskName}</span>
        <div className="button-wrapper">
          <button>&times;</button>
        </div>
      </div>
    );
  }
  
  render() {
    const { params } = this.props;
    const { projectId } = params;
    
    const data = getProjects();
    const activeProject = data.find(project => project.shortId = projectId);
    
    return (
      <ProjectForm 
        project={activeProject}
        handleTaskSubmit={this.addTask}
        handleSubmit={this.handleFormSubmit}
        renderFormTask={this.renderFormTask}
      />
    );
  }
}


function getProjects() {
  return ([
    {
      projectName: "Node Capstone",
      shortId: '123',
      tasks: [
        {
          taskName: 'user flows',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
        {
          taskName: 'mock up',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
        {
          taskName: 'mvp',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
      ]
    },
    {
      projectName: "React Capstone",
      shortId: '456',
      tasks: [
        {
          taskName: 'user flows',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
        {
          taskName: 'mock up',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
        {
          taskName: 'mvp',
          recordedTime: Math.random() * 100,
          id: shortid.generate()
        },
      ]
    },
  ])
}