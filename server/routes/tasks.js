const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
}

// calculate deadline based on priority
function calculateDeadline(startDate, priority) {
    const date = new Date(startDate);
    let daysToAdd = 0;

    if (priority === "High") {
        daysToAdd = 1;
    } else if (priority === "Medium") {
        daysToAdd = 3;
    } else if (priority === "Low") {
        daysToAdd = 5;
    }

    date.setDate(date.getDate() + daysToAdd);
    return date;
}

//  Edit task
router.put("/:id", ensureAuthenticated, async (req, res) => {
    try {
        const { description, priority, startDate } = req.body;
        const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Update only the fields that were changed
        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (startDate) task.startDate = startDate;

        //  Recalculate deadline if startDate or priority is updated
        if (startDate || priority) {
            task.deadline = calculateDeadline(startDate || task.startDate, priority || task.priority);
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Get all tasks
router.get("/", ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Add task
router.post("/", ensureAuthenticated, async (req, res) => {
    try {
        const { description, priority, startDate } = req.body;
        if (!description || !priority || !startDate) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const deadline = calculateDeadline(startDate, priority);

        const newTask = new Task({
            user: req.user._id,
            description,
            priority,
            startDate,
            deadline,
        });

        await newTask.save();
        res.json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Delete task
router.delete("/:id", ensureAuthenticated, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.json({ success: true, taskId: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
