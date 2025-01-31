document.addEventListener('DOMContentLoaded', () => {
    const usersList = document.getElementById('users-list');
  
    // Fetch all users and display top 3 by posts_count
    const fetchAndDisplayTopUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allUsers = await response.json();
            allUsers.sort((a, b) => b.posts_count - a.posts_count);
            const topUsers = allUsers.slice(0, 3);
            usersList.innerHTML = topUsers.map(user => `
                <div class="user-card">
                    <p>${user.username} - Posts: ${user.posts_count}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error fetching and displaying top users:', error);
            alert('Could not load top users.');
        }
    };
  
  
    fetchAndDisplayTopUsers();
  });