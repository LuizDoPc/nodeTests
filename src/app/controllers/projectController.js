const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res)=> {
    try{
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects });

    }catch(err){
        return res.status(400).send({ error: err});
    }
});

router.get('/:projectId', async(req, res) => {
    try{
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({ project });

    }catch(err){
        return res.status(400).send({ error: err});
    }
});

router.post('/', async (req, res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId});

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            project.tasks.push(projectTask)
        }));

        await project.save();

        return res.send({ project });
    }catch(err){
        return res.status(400).send({ error: err});
    }
});

router.put('/:projectId', async (req, res) => {
    try{
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.projectId, 
            { title, description},
            { new: true }
        );

        project.tasks = [];
        await Task.remove({ project: project._id});

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            await projectTask.save();
            project.tasks.push(projectTask)
        }));

        await project.save();

        return res.send({ project });
    }catch(err){
        return res.status(400).send({ error: err});
    }
});

router.delete('/:projectId', async (req, res) => {
    try{
        const project = await Project.findByIdAndRemove(req.params.projectId);

        return res.send();

    }catch(err){
        return res.status(400).send({ error: err});
    }
});



module.exports = app => app.use('/projects', router)