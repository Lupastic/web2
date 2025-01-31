async function handleSignUp(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (!username || !email || !password || !password2) {
        alert('All fields are required!');
        return;
    }

    if (password !== password2) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.user_id) {
                alert(`Registration successful! Your ID is: ${data.user_id}`);
                window.location.href = `/main?user_id=${data.user_id}`;
            } else {
                alert('Registration failed. Please try again.');
            }
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Failed to register. Please try again later.');
    }
}

document.getElementById('signup-form').addEventListener('submit', handleSignUp);
