const express = require('express');
const router = express.Router();
const { createTopic, getAllTopics, getTopicById, updateTopic, deleteTopic } = require('../controllers/ topicsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTopic);
router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.put('/:id', verifyToken, updateTopic);
router.delete('/:id', verifyToken, deleteTopic);

module.exports = router;
