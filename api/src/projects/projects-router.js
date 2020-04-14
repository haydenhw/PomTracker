const path = require('path')
const express = require('express')
const xss = require('xss')
const ProjectsService = require('./projects-service')
const TasksService = require('../tasks/tasks-service')

const projectsRouter = express.Router()
const jsonParser = express.json()

const serializeProject = project => ({
  id: project.id,
  user_id: project.user_id,
  client_id: project.client_id ? xss(project.client_id) : null,
  project_name: xss(project.project_name),
  date_created: project.date_created,
  // TODO serialize tasks also
  tasks: project.tasks
})

// TODO move to external file an import
const response = {
  missingKeyError(res, key) {
    return res.status(400).json({
      error: {message: `Missing '${key}' in request body`}
    })
  }
}

projectsRouter
  .route('/')
  .get(async (req, res, next) => {
    const knexInstance = req.app.get('db')
    try {
      const tasks = await TasksService.getAllTasks(knexInstance)
      let projects = await ProjectsService.getAllProjects(knexInstance)
      projects = projects.map(project => {
        const childTasks = tasks.filter(t => t.project_id === project.id)
        return {
          ...project,
          tasks: childTasks
        }
      })
      res.json(projects.map(serializeProject))
    } catch (err) {
      next(err);
    }
  })
  .post(jsonParser, async (req, res, next) => {
    // what if project had many more properties than this?
    const {project_name, client_id, user_id, tasks} = req.body
    const newProject = {project_name, client_id, user_id}
    // how are the variable names?
    // the order and placement of statements?

    for (const [key, value] of Object.entries(newProject))
      if (value == null)
        // how would your approach to this abstraction differ?
        return response.missingKeyError(res, key);

    try {
      const knexInstance = req.app.get('db');
      const savedProject = await ProjectsService.insertProject(
        knexInstance,
        newProject
      )

      if (tasks) {
        // is 't' a good variable name here ?
        // is it better not to reassign the values of t?
        const newTasks = tasks.map(task => {
          const { client_id, user_id, task_name, recorded_time } = task;
          task = { client_id, user_id, task_name, recorded_time };
          task.project_id = savedProject.id;
          return task;
        })

        for (const task of newTasks) {
          for (const [key, value] of Object.entries(task))
            if (value == null)
              return response.missingKeyError(res, key)
        }

        savedProject.tasks = await TasksService.insertTasks(knexInstance, newTasks)
      }

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${savedProject.id}`))
        .json(serializeProject(savedProject))
    } catch(err) {
      next(err)
    }
  })

projectsRouter
  .route('/:project_id')
  .all((req, res, next) => {
    ProjectsService.getById(
      req.app.get('db'),
      req.params.project_id
    )
      .then(project => {
        if (!project) {
          return res.status(404).json({
            error: {message: `Project doesn't exist`}
          })
        }
        res.project = project
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeProject(res.project))
  })
  .delete((req, res, next) => {
    ProjectsService.deleteProject(
      req.app.get('db'),
      req.params.project_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {project_name, client_id} = req.body
    const projectToUpdate = {project_name, client_id}

    const numberOfValues = Object.values(projectToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'project_name' or 'client_id'`
        }
      })

    ProjectsService.updateProject(
      req.app.get('db'),
      req.params.project_id,
      projectToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = projectsRouter
