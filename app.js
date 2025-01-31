const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
require('dotenv').config({path: path.join(__dirname,'public/db.env')})
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Настройка подключения к базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


// Переходы на страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
app.get('/sign', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sign.html'));
});


// CRUD для пользователей

// Создание пользователя (Create)
app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING *',
            [username, email, password]
        );
        req.session.user_id = newUser.rows[0].user_id;

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

  
  // Получение всех пользователей (Read)
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await pool.query('SELECT * FROM users');
      res.json(allUsers.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Получение одного пользователя по ID (Read)
  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
  
      res.json(user.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Обновление пользователя по ID (Update)
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;
      const updatedUser = await pool.query(
        'UPDATE users SET username = $1, email = $2, password = $3 WHERE user_id = $4 RETURNING *',
        [username, email, password, id]
      );
  
      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
  
      res.json(updatedUser.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Удаление пользователя по ID (Delete)
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
  
      if (deletedUser.rows.length === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
  
      res.json({ message: "Пользователь успешно удален" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });


// CRUD для тем

// Создание темы (Create)
app.post('/api/topics', async (req, res) => {
    try {
      const { title, created_by } = req.body;
      const newTopic = await pool.query(
        'INSERT INTO topics (title, created_by) VALUES($1, $2) RETURNING *',
        [title, created_by]
      );
      res.status(201).json(newTopic.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Получение всех тем (Read)
  app.get('/api/topics', async (req, res) => {
    try {
      const allTopics = await pool.query('SELECT * FROM topics');
      res.json(allTopics.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Получение одной темы по ID (Read)
  app.get('/api/topics/:id', async (req, res) => {
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
  });
  
  // Обновление темы по ID (Update)
  app.put('/api/topics/:id', async (req, res) => {
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
  });
  
  // Удаление темы по ID (Delete)
  app.delete('/api/topics/:id', async (req, res) => {
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
  });


  // CRUD для комментариев

// Создание комментария (Create)
app.post('/api/comments', async (req, res) => {
    try {
      const { comment_text, user_id, topic_id } = req.body;
      const newComment = await pool.query(
        'INSERT INTO comments (comment_text, user_id, topic_id) VALUES($1, $2, $3) RETURNING *',
        [comment_text, user_id, topic_id]
      );
      res.status(201).json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Получение всех комментариев (Read)
  app.get('/api/comments', async (req, res) => {
    const { topic_id } = 1;
    console.log(topic_id)
    try {
        const allComments = await pool.query('SELECT * FROM comments WHERE topic_id = $1', [1]);
        console.log(allComments)
        console.log('Fetched comments:', allComments.rows); 
        res.json(allComments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});
  
  app.put('/api/comments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { comment_text, user_id, topic_id } = req.body;
      const updatedComment = await pool.query(
        'UPDATE comments SET comment_text = $1, user_id = $2, topic_id = $3 WHERE comment_id = $4 RETURNING *',
        [comment_text, user_id, topic_id, id]
      );
  
      if (updatedComment.rows.length === 0) {
        return res.status(404).json({ error: "Комментарий не найден" });
      }
  
      res.json(updatedComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
  });
  
  // Удаление комментария по ID (Delete)
  app.delete('/api/comments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deletedComment = await pool.query('DELETE FROM comments WHERE comment_id = $1 RETURNING *', [id]);
  
      if (deletedComment.rows.length === 0) {
        return res.status(404).json({ error: "Комментарий не найден" });
      }
  
      res.json({ message: "Комментарий успешно удален" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
  });

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Успешное подключение к базе данных:', res.rows[0]);
    }
});