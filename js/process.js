document.addEventListener('DOMContentLoaded', function() {
    // Stacked card implementation
    const stageContainer = document.getElementById('stageContainer');
    const cards = Array.from(document.querySelectorAll('.stage-card'));
    const totalCards = cards.length;
    const navDots = Array.from(document.querySelectorAll('.nav-dot'));
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const miniCardsDesktop = Array.from(document.querySelectorAll('#miniCardsDesktop .mini-card'));
    const miniCardsTablet = Array.from(document.querySelectorAll('#miniCardsTablet .mini-card'));

    let currentIndex = 0;
    let isAnimating = false;
    let autoAdvanceInterval; // Added declaration for autoAdvanceInterval

    // Initialize tooltips
    const keyboardGuide = document.querySelector('.keyboard-guide');
    setTimeout(() => {
        if (keyboardGuide) {
            gsap.to(keyboardGuide, {
                opacity: 0,
                duration: 1,
                delay: 8,
                onComplete: () => {
                    keyboardGuide.style.display = 'none';
                }
            });
        }
    }, 5000);

    // Initial positioning of cards
    function initializeCards() {
        cards.forEach((card, index) => {
            // Set initial positions
            const offset = index - currentIndex;
            positionCard(card, offset);
        });
    }

    // Position a card based on its offset from current
    function positionCard(card, offset) {
        // Different transform values based on position
        if (offset === 0) {
            // Current card - front and center
            gsap.set(card, {
                y: 0,
                z: 100,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                opacity: 1,
                zIndex: totalCards
            });
        } else if (offset < 0) {
            // Cards before current - stacked above
            gsap.set(card, {
                y: offset * -30,
                z: offset * 20,
                rotationX: offset * 5,
                rotationY: 0,
                scale: 1 + (offset * 0.05),
                opacity: 0.7 + (offset * 0.1),
                zIndex: totalCards + offset
            });
        } else {
            // Cards after current - stacked below
            gsap.set(card, {
                y: offset * 30,
                z: offset * -20,
                rotationX: offset * -5,
                rotationY: 0,
                scale: 1 - (offset * 0.05),
                opacity: 0.7 - (offset * 0.1),
                zIndex: totalCards - offset
            });
        }
    }

    // Go to a specific card
    function goToCard(newIndex) {
        if (isAnimating || newIndex === currentIndex) return;
        if (newIndex < 0 || newIndex >= totalCards) return;

        isAnimating = true;

        // Update navigation dots
        navDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === newIndex);
        });

        // Update mini cards
        miniCardsDesktop.forEach((card, i) => {
            card.classList.toggle('active', i === newIndex);
        });

        miniCardsTablet.forEach((card, i) => {
            card.classList.toggle('active', i === newIndex);
        });

        const direction = newIndex > currentIndex ? 1 : -1;

        // First, animate the current card out
        const currentCard = cards[currentIndex];
        if (direction > 0) {
            // Moving forward - current card goes up
            gsap.to(currentCard, {
                y: -60,
                z: 20,
                rotationX: 10,
                opacity: 0.7,
                scale: 0.95,
                duration: 0.5,
                ease: "power2.inOut"
            });
        } else {
            // Moving backward - current card goes down
            gsap.to(currentCard, {
                y: 60,
                z: -20,
                rotationX: -10,
                opacity: 0.7,
                scale: 0.95,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }

        // Animate the new card in
        const newCard = cards[newIndex];
        if (direction > 0) {
            // Coming from below
            gsap.fromTo(newCard,
                { y: 60, z: -20, rotationX: -10, opacity: 0.7, scale: 0.95 },
                {
                    y: 0,
                    z: 100,
                    rotationX: 0,
                    rotationY: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.inOut",
                    delay: 0.1
                }
            );
        } else {
            // Coming from above
            gsap.fromTo(newCard,
                { y: -60, z: 20, rotationX: 10, opacity: 0.7, scale: 0.95 },
                {
                    y: 0,
                    z: 100,
                    rotationX: 0,
                    rotationY: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.inOut",
                    delay: 0.1
                }
            );
        }

        // Update all other cards
        cards.forEach((card, index) => {
            if (index !== currentIndex && index !== newIndex) {
                const offset = index - newIndex;

                gsap.to(card, {
                    y: offset < 0 ? offset * -30 : offset * 30,
                    z: offset < 0 ? offset * 20 : offset * -20,
                    rotationX: offset < 0 ? offset * 5 : offset * -5,
                    rotationY: 0,
                    scale: offset < 0 ? 1 + (offset * 0.05) : 1 - (offset * 0.05),
                    opacity: offset < 0 ? 0.7 + (offset * 0.1) : 0.7 - (offset * 0.1),
                    zIndex: offset < 0 ? totalCards + offset : totalCards - offset,
                    duration: 0.5,
                    ease: "power2.inOut",
                    delay: 0.1
                });
            }
        });

        currentIndex = newIndex;

        // Re-enable navigation after animation completes
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }

    // Navigation event listeners
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToCard(index);
            resetAutoAdvance(); // User interaction should reset auto-advance
        });
    });

    prevButton.addEventListener('click', () => {
        goToCard(Math.max(0, currentIndex - 1));
        resetAutoAdvance(); // User interaction should reset auto-advance
    });

    nextButton.addEventListener('click', () => {
        goToCard(Math.min(totalCards - 1, currentIndex + 1));
        resetAutoAdvance(); // User interaction should reset auto-advance
    });

    // Mini card navigation
    miniCardsDesktop.forEach((card, index) => {
        card.addEventListener('click', () => {
            goToCard(index);
            resetAutoAdvance(); // User interaction should reset auto-advance
        });
    });

    miniCardsTablet.forEach((card, index) => {
        card.addEventListener('click', () => {
            goToCard(index);
            resetAutoAdvance(); // User interaction should reset auto-advance
        });
    });

    // Initialize card positions
    initializeCards();

    // Create background patterns for each card
    function createCardPattern(canvasId, color, patternType) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = canvas.clientHeight;

        ctx.clearRect(0, 0, width, height);

        switch(patternType) {
            case 'circles':
                drawCirclePattern(ctx, width, height, color);
                break;
            case 'grid':
                drawGridPattern(ctx, width, height, color);
                break;
            case 'dots':
                drawDotsPattern(ctx, width, height, color);
                break;
            case 'zigzag':
                drawZigzagPattern(ctx, width, height, color);
                break;
            case 'triangles':
                drawTrianglesPattern(ctx, width, height, color);
                break;
        }
    }

    function drawCirclePattern(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 20 + Math.random() * 60;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawGridPattern(ctx, width, height, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;

        const gridSize = 40;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    function drawDotsPattern(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;

        const dotSize = 5;
        const spacing = 25;

        for (let x = 0; x < width; x += spacing) {
            for (let y = 0; y < height; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawZigzagPattern(ctx, width, height, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.1;

        const zigHeight = 20;
        const spacing = 40;

        for (let y = 0; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);

            let up = true;
            for (let x = 0; x < width; x += zigHeight) {
                ctx.lineTo(x, up ? y - zigHeight / 2 : y + zigHeight / 2);
                up = !up;
            }

            ctx.stroke();
        }
    }

    function drawTrianglesPattern(ctx, width, height, color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;

        const size = 40;

        for (let x = 0; x < width; x += size * 2) {
            for (let y = 0; y < height; y += size * 2) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y + size);
                ctx.lineTo(x - size, y + size);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    // Initialize card patterns
    createCardPattern('pattern1', '#ffffff', 'circles');
    createCardPattern('pattern2', '#ffffff', 'grid');
    createCardPattern('pattern3', '#ffffff', 'dots');
    createCardPattern('pattern4', '#ffffff', 'zigzag');
    createCardPattern('pattern5', '#ffffff', 'triangles');

    // Create background particles
    const particlesContainer = document.getElementById('particles');

    function createParticles() {
        const particleCount = 100;

        if (!particlesContainer) return; // Guard against missing container

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');

            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;

            // Random size
            const size = Math.random() * 8 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;

            // Random opacity
            particle.style.opacity = Math.random() * 0.3;

            // Animation
            const duration = Math.random() * 100 + 50;
            // Note: CSS for 'float' animation is not provided in the original HTML's style block.
            // This line is syntactically correct JS, but the animation won't run without CSS definition.
            particle.style.animation = `float ${duration}s infinite linear`;
            particle.style.animationDelay = `-${Math.random() * 100}s`;

            particlesContainer.appendChild(particle);
        }
    }

    // Initialize everything
    function init() {
        // Initialize particles
        createParticles();

        // Initialize tab switching (commented out as per original intention)
        // initializeTabSwitching();

        // Populate stage-specific content (commented out as per original intention)
        // populateStageContent();

        // Initialize card positions
        initializeCards();

        // Start auto-advance
        startAutoAdvance();

        // Add mouse movement parallax effect for cards
        document.addEventListener('mousemove', (e) => {
            if (isAnimating) return;

            const xPos = (e.clientX / window.innerWidth) - 0.5;
            const yPos = (e.clientY / window.innerHeight) - 0.5;

            const currentCard = cards[currentIndex];

            gsap.to(currentCard, {
                rotationY: xPos * 5,
                rotationX: -yPos * 5,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        // Add touch/swipe navigation on mobile
        let touchStartY = 0;
        let touchStartX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;

            const deltaY = touchEndY - touchStartY;
            const deltaX = touchEndX - touchStartX;

            // Primarily respond to vertical swipes
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                if (deltaY < 0) {
                    // Swipe up - go to next
                    goToCard(Math.min(totalCards - 1, currentIndex + 1));
                } else {
                    // Swipe down - go to previous
                    goToCard(Math.max(0, currentIndex - 1));
                }
                resetAutoAdvance();
            } else if (Math.abs(deltaX) > 100) {
                // Also respond to strong horizontal swipes
                if (deltaX < 0) {
                    // Swipe left - go to next
                    goToCard(Math.min(totalCards - 1, currentIndex + 1));
                } else {
                    // Swipe right - go to previous
                    goToCard(Math.max(0, currentIndex - 1));
                }
                resetAutoAdvance();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                goToCard(Math.max(0, currentIndex - 1));
                resetAutoAdvance();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                goToCard(Math.min(totalCards - 1, currentIndex + 1));
                resetAutoAdvance();
            } else if (e.key >= '1' && e.key <= '5') {
                // Number keys 1-5 to go directly to stages
                e.preventDefault();
                const targetIndex = parseInt(e.key) - 1;
                if (targetIndex >= 0 && targetIndex < totalCards) {
                    goToCard(targetIndex);
                    resetAutoAdvance();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Reinitialize card patterns
            createCardPattern('pattern1', '#ffffff', 'circles');
            createCardPattern('pattern2', '#ffffff', 'grid');
            createCardPattern('pattern3', '#ffffff', 'dots');
            createCardPattern('pattern4', '#ffffff', 'zigzag');
            createCardPattern('pattern5', '#ffffff', 'triangles');
        });
    }

    // Auto-advance slides
    function startAutoAdvance() {
        if (autoAdvanceInterval) { // Clear existing interval if any
            clearInterval(autoAdvanceInterval);
        }
        autoAdvanceInterval = setInterval(() => {
            if (!document.hidden && !isAnimating) { // Check document visibility and animation state
                const nextIndex = (currentIndex + 1) % totalCards;
                goToCard(nextIndex);
            }
        }, 8000);
    }

    function resetAutoAdvance() {
        clearInterval(autoAdvanceInterval);
        startAutoAdvance();
    }

    // Initialize the application
    init();
});
