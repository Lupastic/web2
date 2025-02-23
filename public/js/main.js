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
                        <button class="edit-toggle-btn" style="background-color: green; color: white;">Edit</button>
                        <button class="delete-btn" style="background-color: red; color: white;">Delete</button>
                        <button class="comment-toggle-btn" style="background-color: blue; color: white;">Comment</button>
                        <button class="view-all-comments-btn" style="background-color: gray; color: white;">View All Comments</button>
                    </div>
                    <div class="edit-section" style="display: none; margin-top: 10px; padding: 10px; background: #eef; border-radius: 5px;">
                        <input type="text" class="edit-input" value="${topic.title}" style="width: 80%; padding: 5px; border: 1px solid #ccc; border-radius: 5px;" />
                        <button class="submit-edit-btn" style="background-color: darkgreen; color: white; padding: 5px 10px; border-radius: 5px;">Save</button>
                    </div>
                    <div class="comment-section" style="display: none; margin-top: 10px; padding: 10px; background: #eef; border-radius: 5px;">
                        <input type="text" class="comment-input" placeholder="Enter your comment" style="width: 80%; padding: 5px; border: 1px solid #ccc; border-radius: 5px;" />
                        <button class="submit-comment-btn" style="background-color: darkblue; color: white; padding: 5px 10px; border-radius: 5px;">Submit</button>
                    </div>
                </div>
                <div class="comments-list" id="comments-${topic.topic_id}" style="border-left: 4px solid #ccc; padding: 10px; margin-top: 10px; background-color: #f9f9f9; border-radius: 5px;">
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching topics:', error);
            alert('Could not load topics. Please try again.');
        }
    };

    addTopicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = topicNameInput.value.trim();
        if (name) {
            try {
                const token = localStorage.getItem('token'); // Get token from storage
                const response = await fetch('/api/topics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // Include token in headers
                    },
                    body: JSON.stringify({ title: name }),
                });
                if (!response.ok) throw new Error('Failed to add topic');
                topicNameInput.value = '';
                fetchTopics();
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

        if (e.target.classList.contains('edit-toggle-btn')) {
            const editSection = topicDiv.querySelector('.edit-section');
            editSection.style.display = editSection.style.display === 'none' ? 'block' : 'none';
        }

        if (e.target.classList.contains('submit-edit-btn')) {
            const editInput = topicDiv.querySelector('.edit-input');
            const newName = editInput.value.trim();
            if (newName) {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: newName }),
                    });
                    if (!response.ok) throw new Error('Failed to update topic');
                    fetchTopics();
                } catch (error) {
                    console.error('Error updating topic:', error);
                }
            }
        }

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this topic?')) {
                try {
                    const response = await fetch(`/api/topics/${topicId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete topic');
                    fetchTopics();
                } catch (error) {
                    console.error('Error deleting topic:', error);
                }
            }
        }

        if (e.target.classList.contains('comment-toggle-btn')) {
            const commentSection = topicDiv.querySelector('.comment-section');
            commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
        }

        if (e.target.classList.contains('submit-comment-btn')) {
            const commentInput = topicDiv.querySelector('.comment-input');
            const commentText = commentInput.value.trim();
            const username = getUsernameFromSession();
            const user_id = getUserIdFromSession();

            if (commentText) {
                try {
                    const response = await fetch('/api/comments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            comment_text: commentText,
                            user_id: user_id,
                            topic_id: topicId,
                            username: username
                        }),
                    });
                    if (!response.ok) throw new Error('Failed to add comment');
                    commentInput.value = '';
                    fetchComments(topicId);
                } catch (error) {
                    console.error('Error adding comment:', error);
                }
            }
        }

        if (e.target.classList.contains('view-all-comments-btn')) {
            const commentsList = document.getElementById(`comments-${topicId}`);
            if (commentsList.style.display === 'none' || commentsList.style.display === '') {
                fetchComments(topicId);
                commentsList.style.display = 'block';
            } else {
                commentsList.style.display = 'none';
            }
        }
    });

    const fetchComments = async (topicId) => {
        try {
            const response = await fetch(`/api/comments?topic_id=${topicId}`);
            if (!response.ok) throw new Error('Failed to fetch comments');
            const comments = await response.json();
            const commentsList = document.getElementById(`comments-${topicId}`);
            commentsList.innerHTML = comments.map(comment => `
                <div class="comment" style="padding: 10px; margin-bottom: 8px; border-bottom: 1px solid #ddd; background-color: #fff; border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
                    <p style="margin: 0; font-size: 14px;"><strong>${comment.username}:</strong> ${comment.comment_text}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    fetchTopics();
});

// Function to call after successful login
async function handleLoginSuccess(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('username', data.username);
    // Redirect or update UI as needed
}

// Implement the functions.
function getUsernameFromSession() {
    return localStorage.getItem('username');
}

function getUserIdFromSession() {
    return localStorage.getItem('userId');
}
