// Define variables
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start-button");

// Snake properties
const snakeSize = 10;
const snakeSpeed = 150;
const snakeColor = "green";

// Initialize the snake
let snake = [{ x: 10, y: 10 }];
let food = getRandomFoodPosition();
let dx = snakeSize;
let dy = 0;
let score = 0;

// Handle key presses to control the snake
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const keyPressed = event.key;
    switch (keyPressed) {
        case "ArrowUp":
            if (dy !== snakeSize) {
                dx = 0;
                dy = -snakeSize;
            }
            break;
        case "ArrowDown":
            if (dy !== -snakeSize) {
                dx = 0;
                dy = snakeSize;
            }
            break;
        case "ArrowLeft":
            if (dx !== snakeSize) {
                dx = -snakeSize;
                dy = 0;
            }
            break;
        case "ArrowRight":
            if (dx !== -snakeSize) {
                dx = snakeSize;
                dy = 0;
            }
            break;
    }
}

// Start the game when the "Start Game" button is clicked
startButton.addEventListener("click", startGame);

function startGame() {
    startButton.disabled = true;
    setInterval(moveSnake, snakeSpeed);
}

// Move the snake and check for collisions
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check for collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }

    snake.unshift(head);

    // Check for collision with walls or self
    if (
        head.x < 0 ||
        head.x >= canvas.width ||
        head.y < 0 ||
        head.y >= canvas.height ||
        checkSelfCollision()
    ) {
        endGame();
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the snake and food
    drawSnake();
    drawFood();
}

// Draw the snake on the canvas
function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    });
}

// Generate random food position
function getRandomFoodPosition() {
    const x = Math.floor(Math.random() * (canvas.width / snakeSize)) * snakeSize;
    const y = Math.floor(Math.random() * (canvas.height / snakeSize)) * snakeSize;
    return { x, y };
}

// Draw food on the canvas
function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
}

// Check if the snake collides with itself
function checkSelfCollision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// End the game
function endGame() {
    alert(`Game Over! Your score: ${score}`);
    location.reload();
}
