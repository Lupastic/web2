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

    const userId = Math.floor(Math.random() * 1000);

    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: userId, name: username })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Registration successful! Your ID is: ${data.user.id}`);
            console.log(`Registered User:`, data.user);
            window.location.href = '/main';
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('Failed to register. Please try again later.');
    }
}