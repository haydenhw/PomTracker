import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { hashHistory } from 'react-router';
import shortid from 'shortid';

import {
  deleteTask,
  decrementTimer,
  changeActiveContextMenu,
  confirmDeleteTask,
  fetchProjects,
  setSelectedProject,
  setTempTasks,
  toggleAddTasksForm,
  toggleConfig,
  toggleEditTaskForm,
  toggleOnboardMode,
  toggleTimer,
} from '../actions/indexActions';

import { secondsToHMMSS } from 'helpers/time';

import List from '../components/List';
import Nag from '../components/Nag';
import Timesheet from '../components/Timesheet';
import TimesheetListItem from '../components/TimesheetListItem';
import TotalTime from '../components/TotalTime';
import ContextMenu from './ContextMenu';
import Modal from './Modal';
import Select from './Select';
import Timer from './Timer';

import { isDevOnboardingActive } from '../srcConfig/devSettings';

let TimerPage = class extends Component {
  constructor(props) {
    super(props);

    const { tasks } = this.props;

    this.state = {
      tasks,
      activeTaskId: null,
      activeContextMenuParentId: null,
      clickedTaskId: null,
      selectedTaskId: null
    };
  }

  static defaultProps = {
    tasks: []
  }

  shouldComponentUpdate(nextProps) {
    const { isModalActive } = this.props;

    if (this.props.selectedProjectId && (nextProps.selectedProjectId !== this.props.selectedProjectId) && isModalActive) {
      return false;
    }

    return true;
  }
  
  componentWillMount() {
    const { isOnboardingActive, projects, setSelectedProject, toggleOnboardMode } = this.props;
    
    if (isDevOnboardingActive) {
      !isOnboardingActive && toggleOnboardMode();
      return null;
    }

    if (
      (sessionStorage.isFirstSessionVisit === undefined && isDevOnboardingActive) ||
      ((projects.length === 0) && isOnboardingActive)
    ) {
      sessionStorage.isFirstSessionVisit = false;
      toggleOnboardMode();
      return null;
    }

    if ((projects.length === 0) && !isOnboardingActive) {
      hashHistory.push('/projects');
      return null;
    }
    
    if (
      localStorage.selectedProjectId &&
      projects.find(project => project.shortId === localStorage.selectedProjectId)
    ) {
      setSelectedProject(localStorage.selectedProjectId);
    } else {
      setSelectedProject(projects[projects.length - 1].shortId);
    }

    this.setState({ selectedTaskId: localStorage.prevSelectedTaskId });
  }

  componentDidUpdate(prevProps, prevState) {
    const { tasks } = this.props;

    if ((prevProps.tasks.length !== tasks.length) && (tasks.length === 0)) {
      localStorage.setItem('prevSelectedTaskId', null);
      this.setState({ selectedTaskId: null });
    }
  }

  handleAddTasks() {
    const { toggleAddTasksForm } = this.props;

    toggleAddTasksForm();
  }

  handleEditTask = (taskId) => {
    return () => {
      const { toggleEditTaskForm } = this.props;

      toggleEditTaskForm(taskId);
    };
  }

  handlePlayClick = (taskId) => {
    return () => {
      const { isTimerActive, toggleTimer } = this.props;
      const { selectedTaskId } = this.state;

      if (isTimerActive && (selectedTaskId === taskId)) {
        toggleTimer();
        return null;
      }

      if (isTimerActive && !(selectedTaskId === taskId)) {
        this.setState({ activeTaskId: taskId });
        this.handleTaskChange(taskId);
        return null;
      }

      this.setState({ activeTaskId: taskId }, toggleTimer);
      this.handleTaskChange(taskId);
    };
  }
  
  handleTaskChange(taskId, callback) {
    if (localStorage.prevSelectedTaskId !== taskId) {
      localStorage.setItem('prevSelectedTaskId', taskId);
    }

    this.setState({ selectedTaskId: taskId });
  }

  handleTaskDelete = (selectedProject, task) => {
    return () => {
      const { confirmDeleteTask } = this.props;

      confirmDeleteTask({
        payload: [selectedProject, task, true],
        taskName: task.taskName,
      });
    };
  }

  handleTaskItemClick = (taskId) => {
    return () => {
      this.handleTaskChange(taskId);
    };
  }

  setActiveTask(selectedTaskId) {
    this.setState({ activeTaskId: selectedTaskId });
  }

  setActiveContextMenu = (activeContextMenuParentId) => {
    return () => {
      this.setState({ activeContextMenuParentId });
    };
  }

  renderTask(task) {
    const { changeActiveContextMenu, isTimerActive, selectedProject } = this.props;
    const { activeTaskId, selectedTaskId } = this.state;
    const { shortId, taskName, recordedTime } = task;

    return (
      <TimesheetListItem
        actionIconClass="play"
        key={shortid.generate()}
        handleItemClick={this.handleTaskItemClick(shortId)}
        handlePlayClick={this.handlePlayClick(shortId)}
        isActive={(activeTaskId === shortId) && isTimerActive}
        isSelected={selectedTaskId === shortId}
        title={taskName}
        time={recordedTime}

      >
        <ContextMenu
          className="list-item-context-menu"
          onMenuClick={changeActiveContextMenu}
          parentId={shortId}
        >
          <li className="popup-menu-item" onClick={this.handleEditTask(shortId)}>
            <i className="context-menu-icon icon-edit" />
            <a>Edit</a>
          </li>
          <li className="popup-menu-item" onClick={this.handleTaskDelete(selectedProject, task)}>
            <i className="context-menu-icon icon-delete" />
            <a>Delete</a>
          </li>
        </ContextMenu>
      </TimesheetListItem>
    );
  }

  renderTaskSelect() {
    const { tasks } = this.props;
    const { selectedTaskId } = this.state;

    const simplifiedTasks = tasks.map((task) => {
      return {
        name: task.taskName,
        id: task.shortId,
      };
    });

    const selectedTask = tasks.find((task) => { return task.shortId === selectedTaskId; });
    const selectedTaskName = selectedTask && selectedTask.taskName;
    const taskSelectHeading = selectedTaskName || 'Click to select a task...';
    const headingClass = selectedTaskName ? '' : 'grey';

    return (
      <Select
        className={'task-select'}
        handleOptionClick={this.handleTaskChange.bind(this)}
        items={simplifiedTasks}
      >
        <span className={headingClass}>{taskSelectHeading}</span>
      </Select>
    );
  }

  render() {
    const { hasFetched, isModalClosing, isOnboardingActive, selectedProject, tasks } = this.props;
    const { activeTaskId, selectedTaskId } = this.state;
    
    const totalTime = tasks.length ? tasks.map((task) => { return Number(task.recordedTime); }).reduce((a, b) => { return a + b; }) : 0;
    const selectedProjectName = selectedProject ? selectedProject.projectName : '';
    
    if (!hasFetched) {
      return <div className="loader">Loading...</div>;
    }
    
    return (
      <div>
        <section className="timer-section">
          <div className="timer-container">
            {tasks.length > 0 && this.renderTaskSelect()}
            <Timer
              activeTaskId={activeTaskId}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              setActiveTask={this.setActiveTask.bind(this)}
            />
          </div>
        </section>
        {tasks.length > 0
          ? <section className="timesheet-section">
            <Timesheet
              buttonText="NEW TASKS"
              handleButtonClick={this.handleAddTasks.bind(this)}
              titleText={<span>Tasks for project <span className={'grey-title-text'} key={shortid.generate()}>{selectedProject.projectName}</span></span>}
            >
              <List className="timesheet-list list" items={tasks} renderItem={this.renderTask.bind(this)} />
              <TotalTime time={secondsToHMMSS(totalTime)} />
            </Timesheet>
          </section>
          : <Nag
            actionButtonText="ADD TASKS"
            nagMessage={<span>Add tasks to project <span className="grey-title-text">{selectedProjectName}</span> to start tracking time.</span>}
            onActionButtonClick={this.handleAddTasks.bind(this)}
          />
        }
        <Modal
          isCloseButtonActive={isDevOnboardingActive || !isOnboardingActive}
          modalClass={`${isOnboardingActive ? 'fullscreen-modal' : 'normal-modal'}`}
          rootModalClass={`${isOnboardingActive ? 'unfold' : 'roadrunner'} ${isModalClosing ? 'out' : ''}`}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { modal, projects, timer } = state;
  const { hasFetched, isFetching, selectedProjectId } = projects;
  const { isModalActive, isModalClosing, isOnboardingActive } = modal;
  const { isTimerActive } = timer;

  const selectedProject = projects.items.find((project) => project.shortId === selectedProjectId);
  const selectedTasks = selectedProject && selectedProject.tasks;
  
  return {
    hasFetched,
    isFetching,
    isModalActive,
    isModalClosing,
    isOnboardingActive,
    isTimerActive,
    selectedProject,
    selectedTasks,
    projects: projects.items,
    tasks:  selectedTasks
  };
};

export default connect(mapStateToProps, {
  changeActiveContextMenu,
  confirmDeleteTask,
  decrementTimer,
  deleteTask,
  fetchProjects,
  setSelectedProject,
  setTempTasks,
  toggleAddTasksForm,
  toggleConfig,
  toggleEditTaskForm,
  toggleOnboardMode,
  toggleTimer,
})(TimerPage);

TimerPage.propTypes = {
  changeActiveContextMenu: PropTypes.func.isRequired,
  confirmDeleteTask: PropTypes.func.isRequired,
  decrementTimer: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  fetchProjects: PropTypes.func.isRequired,
  hasFetched: PropTypes.bool,
  isFetching: PropTypes.bool,
  isModalActive: PropTypes.bool,
  isModalClosing: PropTypes.bool,
  isOnboardingActive: PropTypes.bool,
  isTimerActive: PropTypes.bool,
  projects: PropTypes.array,
  selectedProject: PropTypes.object,
  selectedProjectId: PropTypes.string,
  selectedTasks: PropTypes.array,
  setSelectedProject: PropTypes.func.isRequired,
  setTempTasks: PropTypes.func.isRequired,
  tasks: PropTypes.array,
  toggleAddTasksForm: PropTypes.func.isRequired,
  toggleConfig: PropTypes.func.isRequired,
  toggleEditTaskForm: PropTypes.func.isRequired,
  toggleOnboardMode: PropTypes.func.isRequired,
  toggleTimer: PropTypes.func.isRequired,
};