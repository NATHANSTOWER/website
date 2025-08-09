document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Timeline animation
    const timeline = document.querySelector('.timeline-line');
    if (timeline) {
        const timelineProgress = timeline.querySelector('.timeline-line-progress');
        const timelineItems = document.querySelectorAll('.timeline-item');

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timelineProgress.style.height = '100%';

                    timelineItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('is-visible');
                        }, index * 200);
                    });

                    timelineObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        timelineObserver.observe(timeline);
    }
});
