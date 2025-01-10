const backendUrl = 'http://localhost:5000';
// User register
async function register() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(backendUrl + '/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();
        //alert(res.ok ? data.message : data.error);
        showCustomAlert(res.ok ? data.message : data.error);

    } catch (error) {
        console.error('Error:', error);
        //alert('Login error!');
        showCustomAlert('Login error!');
    }
}

// User login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(backendUrl + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token); // Token save
            window.location.href = 'game.html';
        } else {
            //alert(data.error);
            showCustomAlert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        //alert('Login error!');
        showCustomAlert('Login error!');
    }
}

function showCustomAlert(message) {
    const alertMessage = document.getElementById('alert-message');
    const alertOverlay = document.getElementById('alert-overlay');
    const customAlert = document.getElementById('custom-alert');

    alertMessage.textContent = message;
    alertOverlay.style.display = 'block';
    customAlert.style.display = 'block';
}

function closeCustomAlert() {
    const alertOverlay = document.getElementById('alert-overlay');
    const customAlert = document.getElementById('custom-alert');

    alertOverlay.style.display = 'none';
    customAlert.style.display = 'none';
}

//let userEmail = localStorage.getItem('userEmail'); // Get user email from localStorage

// Get balance
async function getBalance() {
    const token = localStorage.getItem('token'); // Save token after login to localStorage
    if (!token) {
        showCustomAlert('You are not logged in!');
        window.location.href = 'index.html';
        return;
    }

    try {
        const res = await fetch(backendUrl + '/balance', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById('balance').innerText = `${data.balance}`;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        showCustomAlert('Get balance flow error');
    }
}

// Play the game
async function playGame() {
    const betAmount = document.getElementById('bet-amount').value;
    const colorChoice = document.getElementById('color-choice').value;

    if (betAmount > 0 && colorChoice != 'unselected') {
        try {
            const res = await fetch(backendUrl + '/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bet: betAmount,
                    choice: colorChoice
                })
            });

            const data = await res.json();
            showCustomAlert(data.message);
            getBalance();
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Game error!');
        }
    } else {
        showCustomAlert('Please, enter right bet amount and colour choice');
    }
}

// Exit game
async function exitGame() {
    try {
        const res = await fetch(backendUrl + '/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (res.ok) {
            // Remove token
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        } else {
            const data = await res.json();
            showCustomAlert(data.error || 'Logout error');
        }
    } catch (error) {
        console.error('Exit error:', error);
        showCustomAlert('Exit fail. Close browser.');
    }
}

function selectColor(choice) {
    // Change active style for all choices
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active style to selected option
    const selectedOption = document.querySelector(`.color-option[data-choice="${choice}"]`);
    selectedOption.classList.add('active');

    // Save hidden choice
    document.getElementById('color-choice').value = choice;
}

function goAddMoneyPage() {
    window.location.href = 'add-money.html';
}

async function addMoney() {
    const amount = document.getElementById('amount').value;
    if (amount > 0) {
        try {
            const res = await fetch(backendUrl + '/add-money', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ amount: amount })
            });

            if (res.ok) {
                const data = await res.json();
                showCustomAlert(data.message || 'Money added successfully!');
            } else {
                const errorData = await res.json();
                showCustomAlert(errorData.error || 'Error appears!');
            }
        } catch (error) {
            showCustomAlert('Server error, try later:' + error);
        }
    } else {
        showCustomAlert('Enter valid amount.');
    }
}

function goGamePage() {
    window.location.href = 'game.html';
}