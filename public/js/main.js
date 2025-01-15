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
                <div class="topic-card" data-id="${topic.id}">
                    <div class="topic-content">
                        <span class="topic-name">${topic.name}</span>
                    </div>
                    <div class="topic-actions">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </div>
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
                    body: JSON.stringify({ name }),
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
                        body: JSON.stringify({ name: newName }),
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
    });
    fetchTopics();
});
