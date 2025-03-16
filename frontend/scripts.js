const backendUrl = 'http://localhost:5000';

const numbers = [...Array(37).keys()];
const colors = numbers.map(n => n === 0 ? "green" : ([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(n) ? "black" : "red"));

let angle = 0;
let spinVelocity = 0;
let isSpinning = false;
let targetNumber = null;

// Roulette settings
const rouletteSettings = {
    centerX: 200, // Canvas width / 2
    centerY: 200, // Canvas height / 2
    radius: 150,
    segmentAngle: (2 * Math.PI) / numbers.length,
    textColor: "white",
    font: "16px Arial",
    spinDecelerationRate: 0.98,
    baseSpinVelocity: 20,
    arrowColor: "gold",
};

window.onload = function () {
    const page = document.body.getAttribute("data-page");

    if (page === "game") {
        initGamePage();
    } else {
        initIndexPage();
    }
};

const canvas = document.getElementById("rouletteCanvas");
let ctx = null;
if (canvas) {
    ctx = canvas.getContext("2d");
    // Set canvas dimensions based on rouletteSettings
    canvas.width = rouletteSettings.centerX * 2;
    canvas.height = rouletteSettings.centerY * 2;
    drawRoulette();
}

function initIndexPage() {
    console.log("Login page loaded");
}

function initGamePage() {
    console.log("Game page loaded");

    const canvas = document.getElementById("rouletteCanvas");
    if (canvas) {
        ctx = canvas.getContext("2d");
        // Set canvas dimensions based on rouletteSettings
        canvas.width = rouletteSettings.centerX * 2;
        canvas.height = rouletteSettings.centerY * 2;
        drawRoulette();
    }

    getBalance();
}

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

function drawRoulette() {
    if (!ctx || !canvas) return;

    const { centerX, centerY, radius, segmentAngle, textColor, font } = rouletteSettings;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numbers.length; i++) {
        const startAngle = angle + i * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.save(); // Save the current transformation matrix
        ctx.translate(centerX + Math.cos(startAngle + segmentAngle / 2) * (radius * 0.7), centerY + Math.sin(startAngle + segmentAngle / 2) * (radius * 0.7));
        ctx.rotate(startAngle + segmentAngle / 2 + Math.PI / 2); // Rotate the text
        ctx.fillText(numbers[i], 0, 0); // Draw text at the translated origin
        ctx.restore(); // Restore the transformation matrix
    }

    drawArrow();
}

function drawArrow() {
    const { centerX, centerY, radius, arrowColor } = rouletteSettings;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 10, centerY - radius - 20);
    ctx.lineTo(centerX + 10, centerY - radius - 20);
    ctx.fillStyle = arrowColor;
    ctx.fill();
}

if (canvas) {
    drawRoulette();
}

function startRouletteAnimation(resultNumber) {
    if (isSpinning) return;
    isSpinning = true;
    targetNumber = resultNumber;
    spinVelocity = Math.random() * rouletteSettings.baseSpinVelocity / 2 + rouletteSettings.baseSpinVelocity;
    animateSpin();
}

function animateSpin() {
    if (spinVelocity > 0.01) {
        angle += spinVelocity * 0.02;
        spinVelocity *= rouletteSettings.spinDecelerationRate;
        requestAnimationFrame(animateSpin);
    } else {
        isSpinning = false;
        stopOnNumber(targetNumber);
    }
    drawRoulette();
}

function stopOnNumber(targetNumber) {
    const sliceAngle = (2 * Math.PI) / numbers.length;
    const targetIndex = numbers.indexOf(targetNumber);
    const targetAngle = -targetIndex * sliceAngle;
    const correctionAngle = (angle % (2 * Math.PI)) - targetAngle;
    angle -= correctionAngle;
    drawRoulette();
    showCustomAlert(`Roulette stopped on ${targetNumber} (${colors[targetIndex]})`);
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

    if (betAmount > 0 && colorChoice !== 'unselected') {
        try {
            const res = await fetch(backendUrl + '/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ bet: betAmount, choice: colorChoice })
            });

            const data = await res.json();
            if (res.ok) {
                startRouletteAnimation(parseInt(data.message.match(/\d+/)[0])); // Витягуємо число з повідомлення
            }
            getBalance();
        } catch (error) {
            console.error('Error:', error);
            showCustomAlert('Game error!');
        }
    } else {
        showCustomAlert('Please, enter a valid bet and color choice.');
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