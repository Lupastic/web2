const { pool } = require('../db.js');

const createTopic = async (req, res) => {
    try {
        const { title } = req.body;
        const user_id = req.user.userId;
        const user = await pool.query('SELECT username FROM users WHERE user_id = $1', [user_id]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' }); // Handle the case where user doesn't exist
        }
        const username = user.rows[0].username; // Get the username

        const newTopic = await pool.query(
            'INSERT INTO topics (title, user_id, username) VALUES($1, $2, $3) RETURNING *', // Modified INSERT
            [title, user_id, username]
        );

        res.status(201).json(newTopic.rows[0]);
    } catch (err) {
        console.error('Error during topic creation:', err);
        res.status(500).json({ error: "Server error" });
    }
};

const getAllTopics = async (req, res) => {
    try {
        const allTopics = await pool.query('SELECT * FROM topics');
        res.json(allTopics.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const getTopicById = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await pool.query('SELECT * FROM topics WHERE topic_id = $1', [id]);

        if (topic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        res.json(topic.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, created_by } = req.body;
        const updatedTopic = await pool.query(
            'UPDATE topics SET title = $1, created_by = $2 WHERE topic_id = $3 RETURNING *',
            [title, created_by, id]
        );

        if (updatedTopic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        res.json(updatedTopic.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTopic = await pool.query('DELETE FROM topics WHERE topic_id = $1 RETURNING *', [id]);

        if (deletedTopic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        res.json({ message: "Тема успешно удалена" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
};
