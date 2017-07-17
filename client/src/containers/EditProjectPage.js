import  React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { addTask, deleteTask, setSelectedProject, remoteSubmit, updateProject, updateTasks } from '../actions/indexActions';

import { hasAnyValue } from '../helpers/validate';
import { routeToProjects } from '../helpers/route'

import SingleInputForm from '../components/SingleInputForm';
import ProjectTaskForm from './ProjectTaskForm';

class EditProjectPage extends Component {
  constructor(props) {
    super(props)
    
    const { projects, selectedProject } = props;
    
    this.handleEditProjectSubmit = this.handleEditProjectSubmit(selectedProject); 
    this.handleRemoteSubmit = this.handleRemoteSubmit.bind(this);
  }
  
  static defaultProps = {
    projects: []
  }
  
  componentWillMount() {
    this.props.remoteSubmit(null);    
  }  
  
  componentDidUpdate(prevProps){ 
    if (this.props.remoteSubmitForm === "ADD_TASKS" && prevProps.remoteSubmitForm === "ADD_TASKS") {
      routeToProjects();
    } 
  }
  
  handleEditProjectSubmit = (project) => ({ singleInput: projectName }) => {
    const { updateProject, remoteSubmit } = this.props;
    
    if (!hasAnyValue(projectName)) {
      remoteSubmit(null);
      
      throw new SubmissionError({
        singleInput: 'Project name is required' 
      })
    }
    
    // updateProject(project, projectName);
    // remoteSubmit(null);
    // routeToProjects();
  } 
  
  handleRemoteSubmit() {
    const { remoteSubmit } = this.props;
    
    remoteSubmit('ADD_TASKS');
    // remoteSubmit('ADD_PROJECT');
    
    
    // setTimeout(() => remoteSubmit('ADD_TASKS'), 100)
    
  }  
  // handleEditProjectName = (project, updateProject) => ({ projectName }) => { 
  //   const { updateProject } = this.props;
  //     
  //     if (!hasAnyValue(projectName)) {
  //       throw new SubmissionError({
  //         projectName: 'Project name is required' 
  //       })
  //     }
  //     
  //   updateProject(project, projectName);  
  // }
    
  // handleNewChangesSubmit() {
  //   const { remoteSubmit } = this.props;
  //   console.log('asdf')
  //   
  //   this.handleEditProjectName();
  //   this.handleTasksSubmit();
  //   remoteSubmit(null);
  // 
  // handleTasksSubmit({ tasks }) {
  //   const { updateTasks, selectedProjectId } = this.props;
  //   updateTasks(selectedProjectId, tasks);
  
  
  // }

  render() {
    const { remoteSubmitForm, selectedProject } = this.props;
    
    if (!selectedProject) {
      return null; 
    }  
    
    return (
      <div className="fullscreen-form form-page">
        <h2>Edit Project <span>{selectedProject.projectName}</span></h2>
        <ProjectTaskForm 
          handleCancel={routeToProjects}
          handleSubmit={this.handleRemoteSubmit}
          shouldDisableTaskFormFocus={true}
          showTasksForSelectedProject={true}
        >
          <SingleInputForm
            formName={"projectName"}
            initialValues={{ singleInput: selectedProject.projectName }}
            placeholder={"Project Name"}
            // remoteSubmitForm={remoteSubmitForm}
            shouldRenderSubmitButton={false}
            onTargetUpdate={this.handleEditProjectSubmit}
            targetPropKey="remoteSubmitForm"
            targetValue="ADD_PROJECT" 
            form={'project form'}
          />
        </ProjectTaskForm>
      </div>  
    );
  }
}
const mapStateToProps = (state) => {
  const { customForm, selectedProjectId, projects } = state;
  const { remoteSubmitForm } = customForm; 
  
  const selectedProject = state.projects.items.length > 0 && selectedProjectId 
  ? projects.items.find((project) => project.shortId === selectedProjectId)
  : null 
  
  return {
    projects,
    remoteSubmitForm, 
    selectedProjectId,
    selectedProject
  }
}

export default connect(mapStateToProps, { 
  addTask,
  deleteTask,
  remoteSubmit,
  setSelectedProject,
  updateProject,
  updateTasks
})(EditProjectPage);  

EditProjectPage.propTypes = {
  projects: PropTypes.object
}
