document.addEventListener('DOMContentLoaded', () => {
    const topicsList = document.getElementById('topics-list');
    const addTopicForm = document.getElementById('add-topic-form');
    const topicNameInput = document.getElementById('topic-name');

    const fetchTopics = async () => {
        try {
            const response = await fetch('/api/topics');
            if (!response.ok) throw new Error('Failed to fetch topics');
            const topics = await response.json();
            topicsList.innerHTML = topics.map(topic => `
                <div class="topic-card" data-id="${topic.topic_id}">
                    <div class="topic-content">
                        <span class="topic-name">${topic.title}</span>
                    </div>
                    <div class="topic-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                        <button class="comment-btn">Comment</button>
                        <button class="view-all-comments-btn">View All Comments</button>
                    </div>  
                </div>
                <div class="comments-list" id="comments-${topic.topic_id}"></div>
            `).join('');            
        } catch (error) {
            console.error('Error fetching topics:', error);
            alert('Could not load topics. Please try again.');
        }
    };

    // Add a new topic
    addTopicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = topicNameInput.value.trim();
        if (name) {
            try {
                const response = await fetch('/api/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: name }),
                });
                if (!response.ok) throw new Error('Failed to add topic');
                topicNameInput.value = '';
                fetchTopics();
                alert('Topic added successfully!');
            } catch (error) {
                console.error('Error adding topic:', error);
                alert('Could not add topic. Please try again.');
            }
        }
    });
   topicsList.addEventListener('click', async (e) => {
        const topicDiv = e.target.closest('.topic-card');
        if (!topicDiv) return;
        const topicId = topicDiv.dataset.id;
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this topic?')) {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete topic');
                    fetchTopics();
                    alert('Topic deleted successfully!');
                } catch (error) {
                    console.error('Error deleting topic:', error);
                    alert('Could not delete topic. Please try again.');
                }
            }
        }
    
        if (e.target.classList.contains('edit-btn')) {
            const currentName = topicDiv.querySelector('.topic-name').textContent;
            const newName = prompt('Enter new topic name:', currentName);
            if (newName && newName !== currentName) {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newName }),
                    });
                    if (!response.ok) throw new Error('Failed to update topic');
                    fetchTopics();
                    alert('Topic updated successfully!');
                } catch (error) {
                    console.error('Error updating topic:', error);
                    alert('Could not update topic. Please try again.');
                }
            }
        }
    
        if (e.target.classList.contains('comment-btn')) {
            const commentText = prompt('Enter your comment:');
            if (commentText) {
                try {
                    const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment_text: commentText,
                            user_id: 1,
                            topic_id: topicId
                        }),
                    });
                    if (!response.ok) throw new Error('Failed to add comment');
                    fetchComments(topicId);
                    alert('Comment added successfully!');
                } catch (error) {
                    console.error('Error adding comment:', error);
                    alert('Could not add comment. Please try again.');
                }
            }
        }
    
        if (e.target.classList.contains('view-all-comments-btn')) {
            fetchComments(topicId)
        }
    });
    
    const fetchComments = async (topicId) => {
        try {
            const response = await fetch(`/api/comments?topic_id=${topicId}`); // Исправленный запрос
            if (!response.ok) throw new Error('Failed to fetch comments');
            const comments = await response.json();
            const commentsList = document.getElementById(`comments-${topicId}`);
             commentsList.innerHTML = comments.map(comment => `
                <div class="comment">
                    <p>${comment.comment_text}</p> 
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert('Could not load comments. Please try again.');
        }
    };

    fetchTopics();
});