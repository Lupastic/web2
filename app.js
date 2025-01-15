const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let topics = []; 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
app.get('/api/topics', (req, res) => {
    res.json(topics);
});
app.post('/api/topics', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
    }
    const newTopic = { id: Date.now(), name };
    topics.push(newTopic);
    res.status(201).json(newTopic);
});
app.put('/api/topics/:id', (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const topic = topics.find(t => t.id === parseInt(id));

    if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
    }
    if (!name) {
        return res.status(400).json({ error: 'Topic name is required' });
    }

    topic.name = name;
    res.json(topic);
});
app.delete('/api/topics/:id', (req, res) => {
    const { id } = req.params;
    const index = topics.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: 'Topic not found' });
    }

    topics.splice(index, 1);
    res.status(204).send();
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
