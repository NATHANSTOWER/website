document.addEventListener('DOMContentLoaded', () => {
    const imageContainer = document.getElementById('interactive-image-container');
    const image = document.getElementById('interactive-image');

    if (!imageContainer || !image) {
        return;
    }

    let scale = 1;
    let isPanning = false;
    let startPos = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    let imagePos = { x: 0, y: 0 };

    // --- Mouse Movement (Parallax) ---
    document.addEventListener('mousemove', (e) => {
        if (isPanning) return;

        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1

        const moveX = x * -10; // Adjust multiplier for effect strength
        const moveY = y * -10;

        image.style.transform = `translate(${imagePos.x + moveX}px, ${imagePos.y + moveY}px) scale(${scale})`;
    });

    // --- Zoom ---
    imageContainer.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = scale + delta;

        if (newScale >= 1 && newScale <= 3) {
            scale = newScale;
            image.style.transform = `translate(${imagePos.x}px, ${imagePos.y}px) scale(${scale})`;
        }
    });

    // --- Pan ---
    imageContainer.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isPanning = true;
            startPos.x = e.clientX - imagePos.x;
            startPos.y = e.clientY - imagePos.y;
            imageContainer.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mouseup', () => {
        isPanning = false;
        imageContainer.style.cursor = 'grab';
    });

    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            currentPos.x = e.clientX - startPos.x;
            currentPos.y = e.clientY - startPos.y;

            // Clamp the panning within reasonable bounds
            const rect = image.getBoundingClientRect();
            const containerRect = imageContainer.getBoundingClientRect();

            const maxX = (rect.width - containerRect.width) / 2;
            const maxY = (rect.height - containerRect.height) / 2;

            imagePos.x = Math.max(-maxX, Math.min(maxX, currentPos.x));
            imagePos.y = Math.max(-maxY, Math.min(maxY, currentPos.y));

            image.style.transform = `translate(${imagePos.x}px, ${imagePos.y}px) scale(${scale})`;
        }
    });

    imageContainer.style.cursor = 'grab';
});
