document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');

    const loadPage = async (url, pushState = true) => {
        try {
            // Add loading indicator
            mainContent.classList.add('loading');

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const newMainContent = doc.getElementById('main-content');
            const newTitle = doc.querySelector('title').innerText;

            if (newMainContent) {
                mainContent.innerHTML = newMainContent.innerHTML;
                document.title = newTitle;

                if (pushState) {
                    history.pushState({ path: url }, '', url);
                }

                // Re-initialize any scripts that need to run on new content
                reinitializePageScripts();
            }

        } catch (error) {
            console.error('Failed to load page:', error);
            // Fallback to traditional navigation
            window.location.href = url;
        } finally {
            mainContent.classList.remove('loading');
        }
    };

    // Intercept clicks on internal links
    document.body.addEventListener('click', (e) => {
        let target = e.target;
        // Find the anchor tag if the click was on a child element
        while (target && target.tagName !== 'A') {
            target = target.parentElement;
        }

        if (target && target.tagName === 'A' && target.href && target.host === window.location.host) {
            // Check if it's a link to a page and not a hash link for the same page
             if (!target.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                loadPage(target.href);
            }
        }
    });

    // Handle back/forward navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.path) {
            loadPage(e.state.path, false);
        } else {
            // If no state, it might be the initial state, just reload
            // Or handle it as you see fit
            loadPage(location.pathname + location.search, false);
        }
    });

    const reinitializePageScripts = () => {
        // This function is crucial. It needs to re-run the initialization
        // logic from the original inline script for the new content.
        // We'll need to extract the relevant parts of the init() function from index.html

        // Let's create a new function for this in the global scope or attach it to an object
        // if we move all scripts to this file.
        if (typeof window.initPage === 'function') {
            // We need to re-query all the elements for the new content
            // A better approach would be to pass the container to initPage
            // e.g. initPage(mainContent)
            // For now, let's just call it again.
            window.initPage();
        }
    };
});
