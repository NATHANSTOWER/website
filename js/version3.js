// ===== RUBIKS CUBE SYSTEM =====
class RubiksCubeBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cubeGroup = null;
        this.pieces = [];
        this.isExploded = false;
        this.autoMode = true;
        this.scrollProgress = 0;
        this.animationFrame = null;

        // Enhanced colors matching the design
        this.colors = {
            white: 0xffffff,
            yellow: 0xFFD700,  // Accent color
            orange: 0xFFA500,  // Accent variation
            red: 0xE6C200,     // Accent dark
            blue: 0x1A2B4A,    // Primary light
            green: 0x2D4A75    // Primary lighter
        };

        this.init();
        this.bindEvents();
        this.startAutoRotation();
    }

    init() {
        const canvas = document.getElementById('rubiks-canvas');
        if (!canvas) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);

        // Camera position
        this.camera.position.set(8, 8, 8);
        this.camera.lookAt(0, 0, 0);

        // Create cube
        this.createCube();
        this.animate();
    }

    createCube() {
        this.cubeGroup = new THREE.Group();
        this.scene.add(this.cubeGroup);
        this.pieces = [];

        const size = 0.95;
        const gap = 0.05;

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const piece = this.createCubePiece(size);
                    piece.position.set(
                        x * (size + gap),
                        y * (size + gap),
                        z * (size + gap)
                    );

                    // Store original position for animations
                    piece.userData = {
                        originalPosition: piece.position.clone(),
                        targetPosition: piece.position.clone(),
                        targetRotation: piece.rotation.clone(),
                        explodeDirection: new THREE.Vector3(x, y, z).normalize().multiplyScalar(3)
                    };

                    this.cubeGroup.add(piece);
                    this.pieces.push(piece);
                }
            }
        }
    }

    createCubePiece(size) {
        const geometry = new THREE.BoxGeometry(size, size, size);

        // Create materials for each face with cube colors
        const materials = [
            new THREE.MeshLambertMaterial({ color: this.colors.red }),    // Right
            new THREE.MeshLambertMaterial({ color: this.colors.orange }), // Left
            new THREE.MeshLambertMaterial({ color: this.colors.white }),  // Top
            new THREE.MeshLambertMaterial({ color: this.colors.yellow }), // Bottom
            new THREE.MeshLambertMaterial({ color: this.colors.blue }),   // Front
            new THREE.MeshLambertMaterial({ color: this.colors.green })   // Back
        ];

        const cube = new THREE.Mesh(geometry, materials);

        // Add edge highlighting
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 2
        }));
        cube.add(line);

        return cube;
    }

    updateScrollEffect() {
        const scrollContainer = document.getElementById('scroll-container');
        if (!scrollContainer) return;

        const scrollTop = scrollContainer.scrollTop;
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        this.scrollProgress = Math.min(scrollTop / maxScroll, 1);

        // Update cube based on scroll
        this.updateCubeState();
    }

    updateCubeState() {
        if (!this.cubeGroup || !this.pieces.length) return;

        // If not in auto mode, let scroll control rotation
        if (!this.autoMode) {
            this.cubeGroup.rotation.x = this.scrollProgress * Math.PI * 2;
            this.cubeGroup.rotation.y = this.scrollProgress * Math.PI * 4;
        }

        this.pieces.forEach((piece) => {
            if (this.scrollProgress >= 0.999) {
                // Snap to final position and rotation when at the very end
                piece.position.copy(piece.userData.originalPosition);
                piece.rotation.set(0, 0, 0);
            } else if (this.scrollProgress > 0.1) {
                // Use a sine wave for a smooth explosion and reassembly arc
                const effectProgress = (this.scrollProgress - 0.1) / 0.899; // from 0 to 1
                const explosionFactor = Math.sin(effectProgress * Math.PI);

                const targetPos = piece.userData.originalPosition.clone()
                    .add(piece.userData.explodeDirection.clone().multiplyScalar(explosionFactor * 5));

                piece.position.lerp(targetPos, 0.1);

                // Also lerp rotation back to 0
                const targetRotation = new THREE.Euler(0, 0, 0);
                piece.rotation.x += (targetRotation.x - piece.rotation.x) * 0.1;
                piece.rotation.y += (targetRotation.y - piece.rotation.y) * 0.1;
                piece.rotation.z += (targetRotation.z - piece.rotation.z) * 0.1;

            } else {
                // Keep pieces together at the start
                piece.position.lerp(piece.userData.originalPosition, 0.1);
                piece.rotation.x *= 0.9;
                piece.rotation.y *= 0.9;
                piece.rotation.z *= 0.9;
            }
        });
    }

    scramble() {
        if (!this.pieces.length) return;

        this.pieces.forEach((piece, index) => {
            // Random rotation animation
            const targetRotation = {
                x: Math.random() * Math.PI * 2,
                y: Math.random() * Math.PI * 2,
                z: Math.random() * Math.PI * 2
            };

            // Animate to random rotation
            gsap.to(piece.rotation, {
                duration: 1 + Math.random(),
                x: targetRotation.x,
                y: targetRotation.y,
                z: targetRotation.z,
                ease: "power2.inOut",
                delay: index * 0.05
            });

            // Small position variation
            const offset = (Math.random() - 0.5) * 0.2;
            gsap.to(piece.position, {
                duration: 0.5,
                x: piece.userData.originalPosition.x + offset,
                y: piece.userData.originalPosition.y + offset,
                z: piece.userData.originalPosition.z + offset,
                ease: "power2.out",
                yoyo: true,
                repeat: 1
            });
        });
    }

    reset() {
        if (!this.pieces.length) return;

        this.pieces.forEach((piece, index) => {
            gsap.to(piece.position, {
                duration: 1,
                x: piece.userData.originalPosition.x,
                y: piece.userData.originalPosition.y,
                z: piece.userData.originalPosition.z,
                ease: "power2.inOut",
                delay: index * 0.03
            });

            gsap.to(piece.rotation, {
                duration: 1,
                x: 0,
                y: 0,
                z: 0,
                ease: "power2.inOut",
                delay: index * 0.03
            });
        });

        gsap.to(this.cubeGroup.rotation, {
            duration: 1.5,
            x: 0,
            y: 0,
            z: 0,
            ease: "power2.inOut"
        });
    }

    startAutoRotation() {
        if (!this.autoMode) return;

        gsap.to(this.cubeGroup.rotation, {
            duration: 20,
            y: Math.PI * 2,
            ease: "none",
            repeat: -1
        });
    }

    toggleAutoMode() {
        this.autoMode = !this.autoMode;

        if (this.autoMode) {
            this.startAutoRotation();
        } else {
            gsap.killTweensOf(this.cubeGroup.rotation);
        }
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());

        if (this.renderer && this.scene && this.camera) {
            this.updateScrollEffect();
            this.renderer.render(this.scene, this.camera);
        }
    }

    handleResize() {
        if (!this.camera || !this.renderer) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    bindEvents() {
        // Control buttons
        document.getElementById('scrambleBtn')?.addEventListener('click', () => this.scramble());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());

        const autoToggle = document.getElementById('autoToggle');
        autoToggle?.addEventListener('click', () => {
            this.toggleAutoMode();
            autoToggle.classList.toggle('active');
        });

        // Scroll tracking
        const scrollContainer = document.getElementById('scroll-container');
        scrollContainer?.addEventListener('scroll', () => this.updateScrollEffect(), { passive: true });

        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// ===== MAIN APPLICATION =====
class PortfolioApp {
    constructor() {
        this.rubiksCube = null;
        this.init();
    }

    async init() {
        // Show loading
        const loadingOverlay = document.getElementById('loadingOverlay');

        try {
            // Initialize Rubik's cube
            await this.waitForThree();
            this.rubiksCube = new RubiksCubeBackground();

            // Initialize other components
            this.initNavigation();
            this.initScrollEffects();

            // Hide loading after everything is ready
            setTimeout(() => {
                loadingOverlay?.classList.add('hidden');
            }, 2000);

        } catch (error) {
            console.error('Initialization error:', error);
            loadingOverlay?.classList.add('hidden');
        }
    }

    waitForThree() {
        return new Promise((resolve) => {
            if (typeof THREE !== 'undefined') {
                resolve();
            } else {
                const checkThree = () => {
                    if (typeof THREE !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkThree, 100);
                    }
                };
                checkThree();
            }
        });
    }

    initNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollContainer = document.getElementById('scroll-container');

        // Navbar scroll effect
        scrollContainer?.addEventListener('scroll', () => {
            if (scrollContainer.scrollTop > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
        }, { passive: true });

        // Smooth scrolling for nav links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement && scrollContainer) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for navbar
                    scrollContainer.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Update active nav link based on scroll position
        const updateActiveLink = () => {
            const sections = document.querySelectorAll('.content-section');
            const scrollTop = scrollContainer?.scrollTop || 0;

            let activeSection = 'hero';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
                    activeSection = section.id;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeSection}`) {
                    link.classList.add('active');
                }
            });
        };

        scrollContainer?.addEventListener('scroll', updateActiveLink, { passive: true });
    }

    initScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        const animatedElements = document.querySelectorAll('.about-text-content, .about-visual-content');
        animatedElements.forEach(el => observer.observe(el));
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Prevent context menu on the canvas
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
});
