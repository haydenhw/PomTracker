Projects
=================

## Get projects 

<strong>GET /api/projects</strong>

Successful response
```json
[
    {
        "id": 1,
        "user_id": "VhwVEJzJe",
        "client_id": "DYVnBHuiU",
        "project_name": "Learn Django",
        "date_created": "2020-05-05T12:06:17.587Z",
        "tasks": [
            {
                "id": 2,
                "client_id": "gNAimlOFBi",
                "user_id": "VhwVEJzJe",
                "task_name": "Build Todo App",
                "recorded_time": 0,
                "project_id": 1,
                "date_created": "2020-05-05T12:06:17.768Z"
            },
            {
                "id": 1,
                "client_id": "q2SmUAJbM9",
                "user_id": "VhwVEJzJe",
                "task_name": "Read Docs",
                "recorded_time": 4,
                "project_id": 1,
               "date_created": "2020-05-05T12:06:17.768Z"
            }
        ]
    }
]
```

## Create project 
<strong>POST /api/projects</strong>

Example request
```json 
{
    "project_name": "Learn Django",
    "user_id": "VhwVEJzJe",
    "client_id": "2ozMBvtbu",
    "tasks": []
}
```

## Update project 
<strong>PATCH /api/projects/:projectId</strong>

Example request
```json
{ 
    "task_name": "Read Docs",
    "recorded_time": 600
}
```
## Delete project 
<strong>DELETE /api/projects/:projectId</strong>

Tasks
=================

## Create task 
<strong>POST /api/tasks</strong>

Example request
```json 
{
   "task_name": "Build Todo App",
   "key": "Sanvq9Vpf",
   "recorded_time": 0,
   "client_id": "WC0sRWkkoI",
   "should_delete": false,
   "user_id": 2,
   "project_id": 2
}
```

## Update task 
<strong>PATCH /api/tasks/:taskId</strong>

Example request
```json
{ 
    "task_name": "Read Docs",
    "recorded_time": 600
}
```
## Delete task 
<strong>DELETE /api/tasks/:taskId</strong>
