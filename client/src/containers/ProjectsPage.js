import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { hashHistory } from 'react-router';
import shortid from 'shortid';

import { secondsToHMMSS } from '../helpers/time';
import { routeToTimerPage } from '../helpers/route';

import {
  addProject,
  changeActiveEditMenu,
  deleteProject,
  setSelectedProject,
  setTempTasks,
  toggleTimer, 
  updateProjectName
} from '../actions/indexActions';

import Modal from './Modal';
import EditMenu from './EditMenu';
import List from '../components/List';
import ListHeader from '../components/ListHeader';
import ListItem from '../components/ListItem';
import TotalTime from '../components/TotalTime';

class ProjectsPage extends Component {
  constructor(){
    super();
    
    this.state = {
      isProjectSelectTipActive: sessionStorage.isProjectSelectTipActive !== undefined
        ? JSON.parse(sessionStorage.isProjectSelectTipActive) 
        : true
    }
  }
  
  static defaultProps = {
    projects: ['filler']
  }
  
  componentWillMount() {
    const { isOnboardingActive } = this.props;
    
    if (isOnboardingActive) {
      routeToTimerPage();
    } 
  }
  
  componentWillMount() {
    
  }   

  handleAddButtonClick() {
    const { setTempTasks } = this.props;
    
    setTempTasks([]);
    hashHistory.push('/projects/new');
  }
  
  handleDeleteOptionClick = (project) => (evt) => {
    evt.stopPropagation();
    
    const { deleteProject } = this.props;
    
    deleteProject(project);
  }
  
  handleEditOptionClick = (project) => (evt) => {
    evt.stopPropagation()
    const { setSelectedProject } = this.props;
    
    setSelectedProject(project.shortId);
    hashHistory.push(`/projects/${project.shortId}`)
  }  
  
  handleListItemClick = (projectId) => () => {
    const { isTimerActive, setSelectedProject, toggleTimer } = this.props;
      
    if (isTimerActive) {
     toggleTimer();
    }
      
    setSelectedProject(projectId);
    routeToTimerPage();
  }  
  
  toggleProjectSelectTip() {
    sessionStorage.setItem('isProjectSelectTipActive', false);
    
    this.setState({ isProjectSelectTipActive: false });
  }
  
  renderProject (project){
    const { changeActiveEditMenu, selectedProjectId } = this.props;
    const { projectName, shortId } = project;
    
    const totalTime = 
      project.tasks.length > 0
        ? project.tasks.map(task => task.recordedTime).reduce((a,b) => a + b)
        : 0;
    
    return (
      <ListItem 
        className="project"
        key={shortid.generate()}
        col1Text={projectName}
        col2Text={secondsToHMMSS(Math.round(totalTime))}
        handleClick={this.handleListItemClick(shortId)}
        isSelected={selectedProjectId === shortId}
      >
        <EditMenu 
          className='list-item-edit-menu'
          onMenuClick={changeActiveEditMenu}    
          parentId={shortId}
        >
          <li className="dropdown-item" onClick={this.handleEditOptionClick(project)}><a>Edit</a></li>
          <li className="dropdown-item" onClick={this.handleDeleteOptionClick(project)}><a>Delete</a></li>
        </EditMenu>  
      </ListItem>
    );
  } 
  
  getTotalTime() {
    const { projects } = this.props;
    
    if(!projects.length) {
      return 0; 
    }
    
    return projects.map(project => {
      if (!project.tasks.length) {
        return 0;
      }
          
      return project.tasks.map(task => Number(task.recordedTime)).reduce((a,b) => a + b);
    })
    .reduce((a,b) => a + b);
  }
  
  render() {
    const { hasFetched, isModalClosing, isOnboardingActive, projects } = this.props;
    const { isProjectSelectTipActive } = this.state;
    const reverseProjects = projects.slice().reverse();
    const totalTime = this.getTotalTime();
    
    if (!hasFetched){
      return <div className="loader">Loading...</div>;
    }
    
    return (
      <div className='projects-page-container'>
        { (isProjectSelectTipActive && projects.length > 1) && 
          <div className="project-select-tip-wrapper">
            <div className="project-select-tip">
              <FontAwesome className="info-icon" name='info-circle'></FontAwesome>  
              <span>To track time for a different project, simply select it from the list below.</span>
              <button onClick={this.toggleProjectSelectTip.bind(this)}>
                <i className="icon-cancel"></i>   
              </button>
            </div>
          </div>  
        }
        { projects.length 
          ? <div>
              <div className="list-container">
                <div className="add-button-wrapper">
                  <button className="add-button material-button" onClick={this.handleAddButtonClick.bind(this)}>NEW PROJECT</button>
                </div>                
                <ListHeader col1Title="Project" col2Title="Logged Time" />
                <List className="project-list" items={reverseProjects} renderItem={this.renderProject.bind(this)}/>
                <TotalTime time={secondsToHMMSS(totalTime)} />
              </div>
            </div> 
          : <div className="list-container">
              <span>No projects exist yet. Create one to get started</span>
              <button className="add-button material-button" onClick={this.handleAddButtonClick.bind(this)}>ADD PROJECT</button>
              <Modal modalClass={`${isOnboardingActive ? 'fullscreen-modal' : 'normal-modal'}`}
               rootModalClass={`${ isOnboardingActive? 'unfold' : 'roadrunner'} ${ isModalClosing ? 'out' : ''}`}
              />
            </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  const {  projects, modal, selectedProjectId, timer } = state; 
  const { isOnboardingActive, isModalClosing } = modal;
  const { hasFetched } = projects;
  const { isTimerActive } = timer;
  
  return {
    hasFetched, 
    isModalClosing,
    isOnboardingActive,
    isTimerActive,
    selectedProjectId,
    projects: projects.items,
  }
}

export default connect(mapStateToProps, { 
  addProject,
  changeActiveEditMenu,
  deleteProject,
  setSelectedProject,
  setTempTasks,
  toggleTimer,
  updateProjectName
})(ProjectsPage);

ProjectsPage.propTypes = {
  projects: PropTypes.array.isRequired
}