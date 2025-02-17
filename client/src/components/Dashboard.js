import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [startDate, setStartDate] = useState("");

    // load tasks
    useEffect(() => {
        axios.get("/api/tasks", { withCredentials: true })
            .then(res => setTasks(res.data))
            .catch(err => console.error("error fetching tasks:", err));
    }, []);

    // handle edit button click
    const handleEditClick = (task) => {
        setEditingTask(task._id);
        setDescription(task.description);
        setPriority(task.priority);
        setStartDate(task.startDate.split("T")[0]); // Format date correctly
    };

    // handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                // Update task
                await axios.put(`/api/tasks/${editingTask}`, { description, priority, startDate }, { withCredentials: true });
                setTasks(tasks.map(task => task._id === editingTask ? { ...task, description, priority, startDate } : task));
            } else {
                // Add new task
                const res = await axios.post("/api/tasks", { description, priority, startDate }, { withCredentials: true });
                setTasks([...tasks, res.data]);
            }
            // Reset form after submission
            setEditingTask(null);
            setDescription("");
            setPriority("Medium");
            setStartDate("");
        } catch (err) {
            console.error("error saving task:", err);
        }
    };

    // handle task deletion
    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`/api/tasks/${id}`, { withCredentials: true });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            console.error("error deleting task:", err);
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`/api/tasks/${editingTask}`, { description, priority, startDate }, { withCredentials: true });

            setTasks(tasks.map(task => task._id === editingTask ? res.data : task));
            setEditingTask(null);
            setDescription("");
            setPriority("Medium");
            setStartDate("");
        } catch (err) {
            console.error("error updating task:", err);
        }
    };


    // handle logout
    const handleLogout = async () => {
        try {
            await axios.get("/api/auth/logout", { withCredentials: true });
            window.location.href = "/";
        } catch (err) {
            console.error("logout failed:", err);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Dashboard</h2>
            <button onClick={handleLogout} className="btn btn-outline-secondary">Logout</button>
            <hr />

            <div className="card mb-4">
                <div className="card-body">
                    <h4 className="card-title">{editingTask ? "Edit Task" : "Add New Task"}</h4>
                    <form onSubmit={editingTask ? handleUpdateTask : handleSubmit}>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                               required/>
                        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required/>
                        <button type="submit">{editingTask ? "Update Task" : "Add Task"}</button>
                        {}
                        {editingTask && <button type="button"
                                                onClick={() => setEditingTask(null)}>Cancel</button>}
                    </form>
                </div>
            </div>
            <h3>Your Tasks</h3>
            {tasks.length === 0 ? (
                <p>No tasks found.</p>
            ) : (
                <ul>
                    {tasks.map(task => (
                        <li key={task._id}>
                            {task.description} - {task.priority} - Deadline: {new Date(task.deadline).toLocaleDateString()}
                            <button onClick={() => handleEditClick(task)}>Edit</button>
                            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dashboard;
