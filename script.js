// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas =
            document.getElementById(
                "gameCanvas"
            );
        this.ctx =
            this.canvas.getContext(
                "2d"
            );

        // Game settings
        this.gridSize = 20;
        this.tileCount =
            this
                .canvas
                .width /
            this
                .gridSize;

        // Game state
        this.gameRunning = false;
        this.gameStarted = false;
        this.gamePaused = false;
        this.gameSpeed = 200; // milliseconds between moves
        this.lastMoveTime = 0;

        // Snake
        this.snake =
            [
                {
                    x: 10,
                    y: 10,
                },
            ];
        this.dx = 0;
        this.dy = 0;
        this.nextDirection =
            {
                dx: 0,
                dy: 0,
            };

        // Food
        this.food =
            {
                x: 15,
                y: 15,
            };

        // Special Foods System
        this.specialFood =
            null;
        this.specialFoodTimer = 0;
        this.specialFoodChance = 0.15; // 15% chance to spawn special food

        // Special food types
        this.specialFoodTypes =
            {
                speed: {
                    color: "#e53e3e",
                    effect: "speed_boost",
                    duration: 5000,
                    symbol: "⚡",
                    description:
                        "Speed Boost!",
                    points: 25,
                },
                multiplier:
                    {
                        color: "#f6e05e",
                        effect: "score_multiplier",
                        duration: 8000,
                        symbol: "✦",
                        description:
                            "2x Score!",
                        points: 30,
                    },
                slow: {
                    color: "#63b3ed",
                    effect: "slow_motion",
                    duration: 6000,
                    symbol: "❄️",
                    description:
                        "Slow Motion!",
                    points: 20,
                },
                golden: {
                    color: "#d69e2e",
                    effect: "bonus_points",
                    duration: 0,
                    symbol: "💎",
                    description:
                        "Bonus Points!",
                    points: 50,
                },
            };

        // Active effects
        this.activeEffects =
            {
                speedBoost: false,
                scoreMultiplier: false,
                slowMotion: false,
            };

        this.effectTimers =
            {};
        this.baseGameSpeed = 200;

        // Score
        this.score = 0;
        this.highScore =
            localStorage.getItem(
                "snakeHighScore"
            ) ||
            0;

        // Game Statistics
        this.stats =
            {
                gamesPlayed:
                    parseInt(
                        localStorage.getItem(
                            "snakeGamesPlayed"
                        ) ||
                            "0"
                    ),
                totalFood:
                    parseInt(
                        localStorage.getItem(
                            "snakeTotalFood"
                        ) ||
                            "0"
                    ),
            };

        // Settings
        this.settings =
            {
                sound:
                    localStorage.getItem(
                        "snakeSound"
                    ) !==
                    "false",
                difficulty:
                    localStorage.getItem(
                        "snakeDifficulty"
                    ) ||
                    "medium",
                theme:
                    localStorage.getItem(
                        "snakeTheme"
                    ) ||
                    "default",
            };

        // Difficulty settings
        this.difficultySettings =
            {
                easy: {
                    speed: 250,
                    speedIncrease: 3,
                },
                medium: {
                    speed: 200,
                    speedIncrease: 5,
                },
                hard: {
                    speed: 150,
                    speedIncrease: 8,
                },
            };

        // Sound effects
        this.sounds =
            {
                eat: this.createSound(
                    800,
                    0.1,
                    "sawtooth"
                ),
                gameOver:
                    this.createSound(
                        150,
                        0.3,
                        "triangle"
                    ),
                move: this.createSound(
                    400,
                    0.05,
                    "sine"
                ),
            };

        // Game elements
        this.elements =
            {
                score: document.getElementById(
                    "score"
                ),
                highScore:
                    document.getElementById(
                        "highScore"
                    ),
                finalScore:
                    document.getElementById(
                        "finalScore"
                    ),
                finalHighScore:
                    document.getElementById(
                        "finalHighScore"
                    ),
                startScreen:
                    document.getElementById(
                        "startScreen"
                    ),
                gameOverScreen:
                    document.getElementById(
                        "gameOverScreen"
                    ),
                pauseScreen:
                    document.getElementById(
                        "pauseScreen"
                    ),
                startBtn:
                    document.getElementById(
                        "startBtn"
                    ),
                restartBtn:
                    document.getElementById(
                        "restartBtn"
                    ),
                resumeBtn:
                    document.getElementById(
                        "resumeBtn"
                    ),
                // Mobile controls
                upBtn: document.getElementById(
                    "upBtn"
                ),
                downBtn:
                    document.getElementById(
                        "downBtn"
                    ),
                leftBtn:
                    document.getElementById(
                        "leftBtn"
                    ),
                rightBtn:
                    document.getElementById(
                        "rightBtn"
                    ),
                pauseBtn:
                    document.getElementById(
                        "pauseBtn"
                    ),
                // New elements
                settingsBtn:
                    document.getElementById(
                        "settingsBtn"
                    ),
                soundBtn:
                    document.getElementById(
                        "soundBtn"
                    ),
                settingsScreen:
                    document.getElementById(
                        "settingsScreen"
                    ),
                closeSettingsBtn:
                    document.getElementById(
                        "closeSettingsBtn"
                    ),
                difficultySelect:
                    document.getElementById(
                        "difficultySelect"
                    ),
                defaultDifficulty:
                    document.getElementById(
                        "defaultDifficulty"
                    ),
                themeSelect:
                    document.getElementById(
                        "themeSelect"
                    ),
                soundToggle:
                    document.getElementById(
                        "soundToggle"
                    ),
                gamesPlayed:
                    document.getElementById(
                        "gamesPlayed"
                    ),
                totalFood:
                    document.getElementById(
                        "totalFood"
                    ),
            };

        this.init();
    }

    createSound(
        frequency,
        duration,
        type = "sine"
    ) {
        return () => {
            if (
                !this
                    .settings
                    .sound
            )
                return;

            const audioContext =
                new (window.AudioContext ||
                    window.webkitAudioContext)();
            const oscillator =
                audioContext.createOscillator();
            const gainNode =
                audioContext.createGain();

            oscillator.connect(
                gainNode
            );
            gainNode.connect(
                audioContext.destination
            );

            oscillator.frequency.value =
                frequency;
            oscillator.type =
                type;

            gainNode.gain.setValueAtTime(
                0,
                audioContext.currentTime
            );
            gainNode.gain.linearRampToValueAtTime(
                0.1,
                audioContext.currentTime +
                    0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime +
                    duration
            );

            oscillator.start(
                audioContext.currentTime
            );
            oscillator.stop(
                audioContext.currentTime +
                    duration
            );
        };
    }

    applyTheme() {
        document.body.className =
            "";
        if (
            this
                .settings
                .theme !==
            "default"
        ) {
            document.body.classList.add(
                `theme-${this.settings.theme}`
            );
        }
    }

    showSettingsAppliedMessage() {
        // Create a temporary message to show settings are being applied
        const message =
            document.createElement(
                "div"
            );
        message.textContent =
            "Settings Applied!";
        message.style.position =
            "fixed";
        message.style.top =
            "20px";
        message.style.left =
            "50%";
        message.style.transform =
            "translateX(-50%)";
        message.style.background =
            "rgba(72, 187, 120, 0.9)";
        message.style.color =
            "white";
        message.style.padding =
            "10px 20px";
        message.style.borderRadius =
            "20px";
        message.style.fontSize =
            "14px";
        message.style.fontWeight =
            "bold";
        message.style.zIndex =
            "1000";
        message.style.animation =
            "fadeInOut 1.5s ease-in-out";

        document.body.appendChild(
            message
        );

        // Remove the message after animation
        setTimeout(
            () => {
                if (
                    message.parentNode
                ) {
                    message.parentNode.removeChild(
                        message
                    );
                }
            },
            1500
        );
    }

    createParticles(
        x,
        y,
        count = 6
    ) {
        const gameBoard =
            this
                .canvas
                .parentElement;
        const canvasRect =
            this.canvas.getBoundingClientRect();
        const boardRect =
            gameBoard.getBoundingClientRect();

        for (
            let i = 0;
            i <
            count;
            i++
        ) {
            const particle =
                document.createElement(
                    "div"
                );
            particle.className =
                "particle";
            if (
                this
                    .settings
                    .theme ===
                "neon"
            ) {
                particle.classList.add(
                    "neon"
                );
            }

            const offsetX =
                canvasRect.left -
                boardRect.left;
            const offsetY =
                canvasRect.top -
                boardRect.top;

            particle.style.left = `${
                offsetX +
                x +
                Math.random() *
                    20 -
                10
            }px`;
            particle.style.top = `${
                offsetY +
                y +
                Math.random() *
                    20 -
                10
            }px`;

            gameBoard.appendChild(
                particle
            );

            setTimeout(
                () => {
                    if (
                        particle.parentNode
                    ) {
                        particle.parentNode.removeChild(
                            particle
                        );
                    }
                },
                800
            );
        }
    }

    init() {
        // Set up canvas size responsively
        this.resizeCanvas();

        // Display initial high score and stats
        this.elements.highScore.textContent =
            this.highScore;
        this.elements.gamesPlayed.textContent =
            this.stats.gamesPlayed;
        this.elements.totalFood.textContent =
            this.stats.totalFood;

        // Apply theme
        this.applyTheme();

        // Set up difficulty
        this.elements.difficultySelect.value =
            this.settings.difficulty;
        this.elements.defaultDifficulty.value =
            this.settings.difficulty;

        // Set up sound toggle
        this.elements.soundToggle.textContent =
            this
                .settings
                .sound
                ? "ON"
                : "OFF";
        this.elements.soundToggle.classList.toggle(
            "off",
            !this
                .settings
                .sound
        );
        this.elements.soundBtn.textContent =
            this
                .settings
                .sound
                ? "🔊"
                : "🔇";

        // Set up event listeners
        this.setupEventListeners();

        // Initial render
        this.render();

        // Start game loop
        this.gameLoop();
    }

    resizeCanvas() {
        // Get the container size and determine appropriate canvas dimensions
        const container =
            this
                .canvas
                .parentElement;
        const containerWidth =
            container.clientWidth;

        // Determine canvas size based on screen size
        let canvasSize;
        if (
            window.innerWidth <=
            450
        ) {
            canvasSize =
                Math.min(
                    containerWidth -
                        20,
                    300
                );
        } else if (
            window.innerWidth <=
            768
        ) {
            canvasSize =
                Math.min(
                    containerWidth -
                        20,
                    350
                );
        } else {
            canvasSize =
                Math.min(
                    containerWidth -
                        20,
                    400
                );
        }

        // Set canvas internal dimensions (for drawing)
        this.canvas.width =
            canvasSize;
        this.canvas.height =
            canvasSize;

        // Update grid calculations
        this.gridSize =
            Math.floor(
                canvasSize /
                    20
            );
        this.tileCount =
            Math.floor(
                canvasSize /
                    this
                        .gridSize
            );

        // Adjust snake and food positions if needed
        if (
            this
                .snake
        ) {
            this.snake.forEach(
                (
                    segment
                ) => {
                    if (
                        segment.x >=
                        this
                            .tileCount
                    )
                        segment.x =
                            this
                                .tileCount -
                            1;
                    if (
                        segment.y >=
                        this
                            .tileCount
                    )
                        segment.y =
                            this
                                .tileCount -
                            1;
                }
            );
        }

        if (
            this
                .food &&
            this
                .food
                .x >=
                this
                    .tileCount
        )
            this.food.x =
                this
                    .tileCount -
                1;
        if (
            this
                .food &&
            this
                .food
                .y >=
                this
                    .tileCount
        )
            this.food.y =
                this
                    .tileCount -
                1;
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener(
            "keydown",
            (
                e
            ) =>
                this.handleKeyPress(
                    e
                )
        );

        // Button controls
        this.elements.startBtn.addEventListener(
            "click",
            () =>
                this.startGame()
        );
        this.elements.restartBtn.addEventListener(
            "click",
            () =>
                this.restartGame()
        );
        this.elements.resumeBtn.addEventListener(
            "click",
            () =>
                this.resumeGame()
        );

        // Mobile controls
        this.elements.upBtn.addEventListener(
            "click",
            () =>
                this.changeDirection(
                    0,
                    -1
                )
        );
        this.elements.downBtn.addEventListener(
            "click",
            () =>
                this.changeDirection(
                    0,
                    1
                )
        );
        this.elements.leftBtn.addEventListener(
            "click",
            () =>
                this.changeDirection(
                    -1,
                    0
                )
        );
        this.elements.rightBtn.addEventListener(
            "click",
            () =>
                this.changeDirection(
                    1,
                    0
                )
        );
        this.elements.pauseBtn.addEventListener(
            "click",
            () =>
                this.togglePause()
        );

        // Touch controls for mobile
        this.elements.upBtn.addEventListener(
            "touchstart",
            (
                e
            ) => {
                e.preventDefault();
                this.changeDirection(
                    0,
                    -1
                );
            }
        );
        this.elements.downBtn.addEventListener(
            "touchstart",
            (
                e
            ) => {
                e.preventDefault();
                this.changeDirection(
                    0,
                    1
                );
            }
        );
        this.elements.leftBtn.addEventListener(
            "touchstart",
            (
                e
            ) => {
                e.preventDefault();
                this.changeDirection(
                    -1,
                    0
                );
            }
        );
        this.elements.rightBtn.addEventListener(
            "touchstart",
            (
                e
            ) => {
                e.preventDefault();
                this.changeDirection(
                    1,
                    0
                );
            }
        );

        // Settings and UI controls
        this.elements.settingsBtn.addEventListener(
            "click",
            () => {
                this.showScreen(
                    "settingsScreen"
                );
            }
        );

        this.elements.closeSettingsBtn.addEventListener(
            "click",
            () => {
                this.hideAllScreens();
            }
        );

        this.elements.soundBtn.addEventListener(
            "click",
            () => {
                this.toggleSound();
            }
        );

        this.elements.soundToggle.addEventListener(
            "click",
            () => {
                this.toggleSound();
            }
        );

        this.elements.themeSelect.addEventListener(
            "change",
            (
                e
            ) => {
                this.settings.theme =
                    e.target.value;
                localStorage.setItem(
                    "snakeTheme",
                    this
                        .settings
                        .theme
                );
                this.applyTheme();

                // Restart game if currently running to apply theme immediately
                if (
                    this
                        .gameRunning
                ) {
                    this.showSettingsAppliedMessage();
                    this.restartGameSafely();
                }
            }
        );

        this.elements.defaultDifficulty.addEventListener(
            "change",
            (
                e
            ) => {
                this.settings.difficulty =
                    e.target.value;
                localStorage.setItem(
                    "snakeDifficulty",
                    this
                        .settings
                        .difficulty
                );
                this.elements.difficultySelect.value =
                    this.settings.difficulty;

                // Restart game if currently running to apply difficulty immediately
                if (
                    this
                        .gameRunning
                ) {
                    this.showSettingsAppliedMessage();
                    this.restartGameSafely();
                }
            }
        );

        this.elements.difficultySelect.addEventListener(
            "change",
            (
                e
            ) => {
                this.settings.difficulty =
                    e.target.value;

                // Restart game if currently running to apply difficulty immediately
                if (
                    this
                        .gameRunning
                ) {
                    this.showSettingsAppliedMessage();
                    this.restartGameSafely();
                }
            }
        );

        // Swipe controls for mobile
        this.addSwipeControls();

        // Window resize handler
        window.addEventListener(
            "resize",
            () => {
                this.resizeCanvas();
                this.render();
            }
        );
    }

    toggleSound() {
        this.settings.sound =
            !this
                .settings
                .sound;
        localStorage.setItem(
            "snakeSound",
            this
                .settings
                .sound
        );
        this.elements.soundToggle.textContent =
            this
                .settings
                .sound
                ? "ON"
                : "OFF";
        this.elements.soundToggle.classList.toggle(
            "off",
            !this
                .settings
                .sound
        );
        this.elements.soundBtn.textContent =
            this
                .settings
                .sound
                ? "🔊"
                : "🔇";
    }

    addSwipeControls() {
        let startX,
            startY;

        this.canvas.addEventListener(
            "touchstart",
            (
                e
            ) => {
                e.preventDefault();
                startX =
                    e
                        .touches[0]
                        .clientX;
                startY =
                    e
                        .touches[0]
                        .clientY;
            }
        );

        this.canvas.addEventListener(
            "touchend",
            (
                e
            ) => {
                e.preventDefault();
                if (
                    !startX ||
                    !startY
                )
                    return;

                const endX =
                    e
                        .changedTouches[0]
                        .clientX;
                const endY =
                    e
                        .changedTouches[0]
                        .clientY;

                const deltaX =
                    endX -
                    startX;
                const deltaY =
                    endY -
                    startY;

                const minSwipeDistance = 30;

                if (
                    Math.abs(
                        deltaX
                    ) <
                        minSwipeDistance &&
                    Math.abs(
                        deltaY
                    ) <
                        minSwipeDistance
                ) {
                    return;
                }

                if (
                    Math.abs(
                        deltaX
                    ) >
                    Math.abs(
                        deltaY
                    )
                ) {
                    // Horizontal swipe
                    if (
                        deltaX >
                        0
                    ) {
                        this.changeDirection(
                            1,
                            0
                        ); // Right
                    } else {
                        this.changeDirection(
                            -1,
                            0
                        ); // Left
                    }
                } else {
                    // Vertical swipe
                    if (
                        deltaY >
                        0
                    ) {
                        this.changeDirection(
                            0,
                            1
                        ); // Down
                    } else {
                        this.changeDirection(
                            0,
                            -1
                        ); // Up
                    }
                }

                startX =
                    null;
                startY =
                    null;
            }
        );
    }

    handleKeyPress(
        e
    ) {
        if (
            !this
                .gameStarted &&
            e.code ===
                "Space"
        ) {
            this.startGame();
            return;
        }

        if (
            this
                .gameRunning &&
            e.code ===
                "Space"
        ) {
            this.togglePause();
            return;
        }

        if (
            this
                .gameRunning &&
            !this
                .gamePaused
        ) {
            switch (
                e.code
            ) {
                case "ArrowUp":
                    e.preventDefault();
                    this.changeDirection(
                        0,
                        -1
                    );
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    this.changeDirection(
                        0,
                        1
                    );
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    this.changeDirection(
                        -1,
                        0
                    );
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    this.changeDirection(
                        1,
                        0
                    );
                    break;
            }
        }
    }

    changeDirection(
        newDx,
        newDy
    ) {
        // Prevent reverse direction
        if (
            this
                .dx !==
                0 &&
            newDx ===
                -this
                    .dx
        )
            return;
        if (
            this
                .dy !==
                0 &&
            newDy ===
                -this
                    .dy
        )
            return;

        this.nextDirection =
            {
                dx: newDx,
                dy: newDy,
            };
    }

    startGame() {
        this.gameRunning = true;
        this.gameStarted = true;
        this.gamePaused = false;
        this.hideAllScreens();
        this.resetGame();
        this.elements.pauseBtn.textContent =
            "⏸";

        // Apply current difficulty selection
        this.settings.difficulty =
            this.elements.difficultySelect.value;
    }

    restartGame() {
        this.hideAllScreens();
        this.startGame();
    }

    restartGameSafely() {
        // Simply restart the game - keeping it simple to avoid breaking anything
        this.hideAllScreens();
        this.startGame();
    }

    resumeGame() {
        this.gamePaused = false;
        this.hideAllScreens();
        this.elements.pauseBtn.textContent =
            "⏸";
    }

    togglePause() {
        if (
            !this
                .gameRunning
        )
            return;

        if (
            this
                .gamePaused
        ) {
            this.resumeGame();
        } else {
            this.gamePaused = true;
            this.showScreen(
                "pauseScreen"
            );
            this.elements.pauseBtn.textContent =
                "▶";
        }
    }

    resetGame() {
        this.snake =
            [
                {
                    x: Math.floor(
                        this
                            .tileCount /
                            2
                    ),
                    y: Math.floor(
                        this
                            .tileCount /
                            2
                    ),
                },
            ];
        this.dx = 0;
        this.dy = 0;
        this.nextDirection =
            {
                dx: 0,
                dy: 0,
            };
        this.score = 0;

        // Set speed based on difficulty
        const difficulty =
            this
                .settings
                .difficulty;
        this.gameSpeed =
            this.difficultySettings[
                difficulty
            ].speed;
        this.speedIncrease =
            this.difficultySettings[
                difficulty
            ].speedIncrease;

        // Clear special food and effects
        this.specialFood =
            null;
        this.specialFoodTimer = 0;
        this.activeEffects =
            {
                speedBoost: false,
                scoreMultiplier: false,
                slowMotion: false,
            };

        // Clear effect timers
        Object.values(
            this
                .effectTimers
        ).forEach(
            (
                timer
            ) =>
                clearTimeout(
                    timer
                )
        );
        this.effectTimers =
            {};

        this.updateScore();
        this.generateFood();
    }

    gameLoop() {
        if (
            this
                .gameRunning &&
            !this
                .gamePaused
        ) {
            const currentTime =
                Date.now();

            // Check if special food should disappear
            if (
                this
                    .specialFood &&
                currentTime >
                    this
                        .specialFoodTimer
            ) {
                this.specialFood =
                    null;
                this.specialFoodTimer = 0;
            }

            if (
                currentTime -
                    this
                        .lastMoveTime >=
                this
                    .gameSpeed
            ) {
                this.update();
                this.lastMoveTime =
                    currentTime;
            }
        }

        this.render();
        requestAnimationFrame(
            () =>
                this.gameLoop()
        );
    }

    update() {
        // Update direction
        this.dx =
            this.nextDirection.dx;
        this.dy =
            this.nextDirection.dy;

        // Don't move if no direction is set
        if (
            this
                .dx ===
                0 &&
            this
                .dy ===
                0
        )
            return;

        // Move snake head
        const head =
            {
                x:
                    this
                        .snake[0]
                        .x +
                    this
                        .dx,
                y:
                    this
                        .snake[0]
                        .y +
                    this
                        .dy,
            };

        // Check wall collision
        if (
            head.x <
                0 ||
            head.x >=
                this
                    .tileCount ||
            head.y <
                0 ||
            head.y >=
                this
                    .tileCount
        ) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (
            this.snake.some(
                (
                    segment
                ) =>
                    segment.x ===
                        head.x &&
                    segment.y ===
                        head.y
            )
        ) {
            this.gameOver();
            return;
        }

        this.snake.unshift(
            head
        );

        // Check food collision
        if (
            head.x ===
                this
                    .food
                    .x &&
            head.y ===
                this
                    .food
                    .y
        ) {
            let points = 10;
            if (
                this
                    .activeEffects
                    .scoreMultiplier
            ) {
                points *= 2;
            }
            this.score +=
                points;
            this
                .stats
                .totalFood++;

            // Play sound and create particles
            this.sounds.eat();
            this.createParticles(
                this
                    .food
                    .x *
                    this
                        .gridSize +
                    this
                        .gridSize /
                        2,
                this
                    .food
                    .y *
                    this
                        .gridSize +
                    this
                        .gridSize /
                        2
            );

            this.updateScore();
            this.generateFood();
            this.increaseSpeed();
        }
        // Check special food collision
        else if (
            this
                .specialFood &&
            head.x ===
                this
                    .specialFood
                    .x &&
            head.y ===
                this
                    .specialFood
                    .y
        ) {
            this.consumeSpecialFood();
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        // Decide if we should generate special food
        const shouldGenerateSpecial =
            Math.random() <
                this
                    .specialFoodChance &&
            !this
                .specialFood;

        if (
            shouldGenerateSpecial
        ) {
            this.generateSpecialFood();
        } else {
            let foodPosition;
            do {
                foodPosition =
                    {
                        x: Math.floor(
                            Math.random() *
                                this
                                    .tileCount
                        ),
                        y: Math.floor(
                            Math.random() *
                                this
                                    .tileCount
                        ),
                    };
            } while (
                this.snake.some(
                    (
                        segment
                    ) =>
                        segment.x ===
                            foodPosition.x &&
                        segment.y ===
                            foodPosition.y
                ) ||
                (this
                    .specialFood &&
                    this
                        .specialFood
                        .x ===
                        foodPosition.x &&
                    this
                        .specialFood
                        .y ===
                        foodPosition.y)
            );

            this.food =
                foodPosition;
        }
    }

    generateSpecialFood() {
        const types =
            Object.keys(
                this
                    .specialFoodTypes
            );
        const randomType =
            types[
                Math.floor(
                    Math.random() *
                        types.length
                )
            ];

        let foodPosition;
        do {
            foodPosition =
                {
                    x: Math.floor(
                        Math.random() *
                            this
                                .tileCount
                    ),
                    y: Math.floor(
                        Math.random() *
                            this
                                .tileCount
                    ),
                };
        } while (
            this.snake.some(
                (
                    segment
                ) =>
                    segment.x ===
                        foodPosition.x &&
                    segment.y ===
                        foodPosition.y
            ) ||
            (this
                .food
                .x ===
                foodPosition.x &&
                this
                    .food
                    .y ===
                    foodPosition.y)
        );

        this.specialFood =
            {
                x: foodPosition.x,
                y: foodPosition.y,
                type: randomType,
                ...this
                    .specialFoodTypes[
                    randomType
                ],
            };

        // Special food disappears after 10 seconds
        this.specialFoodTimer =
            Date.now() +
            10000;
    }

    consumeSpecialFood() {
        const specialFood =
            this
                .specialFood;

        // Add points (with multiplier if active)
        let points =
            specialFood.points;
        if (
            this
                .activeEffects
                .scoreMultiplier
        ) {
            points *= 2;
        }
        this.score +=
            points;
        this
            .stats
            .totalFood++;

        // Create particles with special color
        this.createSpecialParticles(
            specialFood.x *
                this
                    .gridSize +
                this
                    .gridSize /
                    2,
            specialFood.y *
                this
                    .gridSize +
                this
                    .gridSize /
                    2,
            specialFood.color
        );

        // Apply special effect
        this.applySpecialEffect(
            specialFood
        );

        // Show effect message
        this.showEffectMessage(
            specialFood.description
        );

        // Play special sound
        this.sounds.eat();

        // Clear special food
        this.specialFood =
            null;
        this.specialFoodTimer = 0;

        this.updateScore();

        // Don't remove tail segment for special food
    }

    applySpecialEffect(
        specialFood
    ) {
        switch (
            specialFood.effect
        ) {
            case "speed_boost":
                this.activeEffects.speedBoost = true;
                this.gameSpeed =
                    Math.max(
                        this
                            .gameSpeed *
                            0.7,
                        80
                    );
                this.clearEffectTimer(
                    "speedBoost"
                );
                this.effectTimers.speedBoost =
                    setTimeout(
                        () => {
                            this.activeEffects.speedBoost = false;
                            this.resetGameSpeed();
                        },
                        specialFood.duration
                    );
                break;

            case "score_multiplier":
                this.activeEffects.scoreMultiplier = true;
                this.clearEffectTimer(
                    "scoreMultiplier"
                );
                this.effectTimers.scoreMultiplier =
                    setTimeout(
                        () => {
                            this.activeEffects.scoreMultiplier = false;
                        },
                        specialFood.duration
                    );
                break;

            case "slow_motion":
                this.activeEffects.slowMotion = true;
                this.gameSpeed =
                    Math.min(
                        this
                            .gameSpeed *
                            1.5,
                        400
                    );
                this.clearEffectTimer(
                    "slowMotion"
                );
                this.effectTimers.slowMotion =
                    setTimeout(
                        () => {
                            this.activeEffects.slowMotion = false;
                            this.resetGameSpeed();
                        },
                        specialFood.duration
                    );
                break;

            case "bonus_points":
                // Instant effect, no timer needed
                break;
        }
    }

    clearEffectTimer(
        effect
    ) {
        if (
            this
                .effectTimers[
                effect
            ]
        ) {
            clearTimeout(
                this
                    .effectTimers[
                    effect
                ]
            );
            delete this
                .effectTimers[
                effect
            ];
        }
    }

    resetGameSpeed() {
        // Reset to base speed for current difficulty
        const difficulty =
            this
                .settings
                .difficulty;
        this.gameSpeed =
            this.difficultySettings[
                difficulty
            ].speed;

        // Apply current snake length speed increase
        const speedReduction =
            (this
                .snake
                .length -
                1) *
            this
                .speedIncrease;
        this.gameSpeed =
            Math.max(
                this
                    .gameSpeed -
                    speedReduction,
                100
            );

        // Apply active effects
        if (
            this
                .activeEffects
                .speedBoost
        ) {
            this.gameSpeed =
                Math.max(
                    this
                        .gameSpeed *
                        0.7,
                    80
                );
        }
        if (
            this
                .activeEffects
                .slowMotion
        ) {
            this.gameSpeed =
                Math.min(
                    this
                        .gameSpeed *
                        1.5,
                    400
                );
        }
    }

    createSpecialParticles(
        x,
        y,
        color,
        count = 8
    ) {
        const gameBoard =
            this
                .canvas
                .parentElement;
        const canvasRect =
            this.canvas.getBoundingClientRect();
        const boardRect =
            gameBoard.getBoundingClientRect();

        for (
            let i = 0;
            i <
            count;
            i++
        ) {
            const particle =
                document.createElement(
                    "div"
                );
            particle.className =
                "particle special-particle";
            particle.style.background =
                color;

            const offsetX =
                canvasRect.left -
                boardRect.left;
            const offsetY =
                canvasRect.top -
                boardRect.top;

            particle.style.left = `${
                offsetX +
                x +
                Math.random() *
                    30 -
                15
            }px`;
            particle.style.top = `${
                offsetY +
                y +
                Math.random() *
                    30 -
                15
            }px`;

            gameBoard.appendChild(
                particle
            );

            setTimeout(
                () => {
                    if (
                        particle.parentNode
                    ) {
                        particle.parentNode.removeChild(
                            particle
                        );
                    }
                },
                1000
            );
        }
    }

    showEffectMessage(
        message
    ) {
        const effectMsg =
            document.createElement(
                "div"
            );
        effectMsg.textContent =
            message;
        effectMsg.style.position =
            "fixed";
        effectMsg.style.top =
            "60px";
        effectMsg.style.left =
            "50%";
        effectMsg.style.transform =
            "translateX(-50%)";
        effectMsg.style.background =
            "rgba(255, 215, 0, 0.9)";
        effectMsg.style.color =
            "#333";
        effectMsg.style.padding =
            "8px 16px";
        effectMsg.style.borderRadius =
            "15px";
        effectMsg.style.fontSize =
            "16px";
        effectMsg.style.fontWeight =
            "bold";
        effectMsg.style.zIndex =
            "1001";
        effectMsg.style.animation =
            "effectMessage 2s ease-in-out";

        document.body.appendChild(
            effectMsg
        );

        setTimeout(
            () => {
                if (
                    effectMsg.parentNode
                ) {
                    effectMsg.parentNode.removeChild(
                        effectMsg
                    );
                }
            },
            2000
        );
    }

    increaseSpeed() {
        if (
            this
                .gameSpeed >
            100
        ) {
            this.gameSpeed -=
                this.speedIncrease;
        }
    }

    updateScore() {
        this.elements.score.textContent =
            this.score;
        this.elements.score.classList.add(
            "score-animation"
        );
        setTimeout(
            () =>
                this.elements.score.classList.remove(
                    "score-animation"
                ),
            300
        );
    }

    gameOver() {
        this.gameRunning = false;

        // Play game over sound
        this.sounds.gameOver();

        // Update statistics
        this
            .stats
            .gamesPlayed++;
        localStorage.setItem(
            "snakeGamesPlayed",
            this
                .stats
                .gamesPlayed
        );
        localStorage.setItem(
            "snakeTotalFood",
            this
                .stats
                .totalFood
        );

        // Update high score
        if (
            this
                .score >
            this
                .highScore
        ) {
            this.highScore =
                this.score;
            localStorage.setItem(
                "snakeHighScore",
                this
                    .highScore
            );
        }

        // Display final scores and stats
        this.elements.finalScore.textContent =
            this.score;
        this.elements.finalHighScore.textContent =
            this.highScore;
        this.elements.highScore.textContent =
            this.highScore;
        this.elements.gamesPlayed.textContent =
            this.stats.gamesPlayed;
        this.elements.totalFood.textContent =
            this.stats.totalFood;

        this.showScreen(
            "gameOverScreen"
        );
        this.elements.pauseBtn.textContent =
            "⏸";
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle =
            "#2d3748";
        this.ctx.fillRect(
            0,
            0,
            this
                .canvas
                .width,
            this
                .canvas
                .height
        );

        // Draw grid
        this.drawGrid();

        // Draw food
        this.drawFood();

        // Draw special food
        this.drawSpecialFood();

        // Draw snake
        this.drawSnake();
    }

    drawGrid() {
        this.ctx.strokeStyle =
            "#4a5568";
        this.ctx.lineWidth = 0.5;

        for (
            let i = 0;
            i <=
            this
                .tileCount;
            i++
        ) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                i *
                    this
                        .gridSize,
                0
            );
            this.ctx.lineTo(
                i *
                    this
                        .gridSize,
                this
                    .canvas
                    .height
            );
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(
                0,
                i *
                    this
                        .gridSize
            );
            this.ctx.lineTo(
                this
                    .canvas
                    .width,
                i *
                    this
                        .gridSize
            );
            this.ctx.stroke();
        }
    }

    drawFood() {
        this.ctx.fillStyle =
            "#e53e3e";
        this.ctx.beginPath();
        this.ctx.arc(
            this
                .food
                .x *
                this
                    .gridSize +
                this
                    .gridSize /
                    2,
            this
                .food
                .y *
                this
                    .gridSize +
                this
                    .gridSize /
                    2,
            this
                .gridSize /
                2 -
                2,
            0,
            2 *
                Math.PI
        );
        this.ctx.fill();

        // Add shine effect
        this.ctx.fillStyle =
            "#fc8181";
        this.ctx.beginPath();
        this.ctx.arc(
            this
                .food
                .x *
                this
                    .gridSize +
                this
                    .gridSize /
                    3,
            this
                .food
                .y *
                this
                    .gridSize +
                this
                    .gridSize /
                    3,
            this
                .gridSize /
                6,
            0,
            2 *
                Math.PI
        );
        this.ctx.fill();
    }

    drawSpecialFood() {
        if (
            !this
                .specialFood
        )
            return;

        const x =
            this
                .specialFood
                .x *
            this
                .gridSize;
        const y =
            this
                .specialFood
                .y *
            this
                .gridSize;
        const centerX =
            x +
            this
                .gridSize /
                2;
        const centerY =
            y +
            this
                .gridSize /
                2;
        const radius =
            this
                .gridSize /
                2 -
            3;

        // Draw pulsing background
        const pulseScale =
            1 +
            Math.sin(
                Date.now() *
                    0.01
            ) *
                0.1;

        // Outer glow
        this.ctx.fillStyle =
            this
                .specialFood
                .color +
            "40";
        this.ctx.beginPath();
        this.ctx.arc(
            centerX,
            centerY,
            radius *
                pulseScale *
                1.3,
            0,
            2 *
                Math.PI
        );
        this.ctx.fill();

        // Main circle
        this.ctx.fillStyle =
            this.specialFood.color;
        this.ctx.beginPath();
        this.ctx.arc(
            centerX,
            centerY,
            radius *
                pulseScale,
            0,
            2 *
                Math.PI
        );
        this.ctx.fill();

        // Inner highlight
        this.ctx.fillStyle =
            "#ffffff60";
        this.ctx.beginPath();
        this.ctx.arc(
            centerX -
                radius /
                    3,
            centerY -
                radius /
                    3,
            radius /
                3,
            0,
            2 *
                Math.PI
        );
        this.ctx.fill();

        // Draw symbol if canvas supports it
        this.ctx.fillStyle =
            "#ffffff";
        this.ctx.font = `${
            this
                .gridSize *
            0.6
        }px Arial`;
        this.ctx.textAlign =
            "center";
        this.ctx.textBaseline =
            "middle";
        this.ctx.fillText(
            this
                .specialFood
                .symbol,
            centerX,
            centerY
        );
    }

    drawSnake() {
        this.snake.forEach(
            (
                segment,
                index
            ) => {
                if (
                    index ===
                    0
                ) {
                    // Head
                    this.ctx.fillStyle =
                        "#48bb78";
                    this.ctx.fillRect(
                        segment.x *
                            this
                                .gridSize +
                            1,
                        segment.y *
                            this
                                .gridSize +
                            1,
                        this
                            .gridSize -
                            2,
                        this
                            .gridSize -
                            2
                    );

                    // Eyes
                    this.ctx.fillStyle =
                        "#2d3748";
                    const eyeSize = 2;
                    this.ctx.fillRect(
                        segment.x *
                            this
                                .gridSize +
                            this
                                .gridSize /
                                4,
                        segment.y *
                            this
                                .gridSize +
                            this
                                .gridSize /
                                4,
                        eyeSize,
                        eyeSize
                    );
                    this.ctx.fillRect(
                        segment.x *
                            this
                                .gridSize +
                            (3 *
                                this
                                    .gridSize) /
                                4 -
                            eyeSize,
                        segment.y *
                            this
                                .gridSize +
                            this
                                .gridSize /
                                4,
                        eyeSize,
                        eyeSize
                    );
                } else {
                    // Body
                    this.ctx.fillStyle =
                        "#68d391";
                    this.ctx.fillRect(
                        segment.x *
                            this
                                .gridSize +
                            1,
                        segment.y *
                            this
                                .gridSize +
                            1,
                        this
                            .gridSize -
                            2,
                        this
                            .gridSize -
                            2
                    );
                }
            }
        );
    }

    showScreen(
        screenId
    ) {
        this.hideAllScreens();
        this.elements[
            screenId
        ].classList.remove(
            "hidden"
        );
    }

    hideAllScreens() {
        this.elements.startScreen.classList.add(
            "hidden"
        );
        this.elements.gameOverScreen.classList.add(
            "hidden"
        );
        this.elements.pauseScreen.classList.add(
            "hidden"
        );
        this.elements.settingsScreen.classList.add(
            "hidden"
        );
    }
}

// Initialize game when DOM is loaded
document.addEventListener(
    "DOMContentLoaded",
    () => {
        new SnakeGame();
    }
);
