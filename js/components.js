// Component loader
class ComponentLoader {
    static async loadComponent(containerId, filePath) {
        try {
            const response = await fetch(filePath);
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
        } catch (error) {
            console.error('Error loading component:', error);
        }
    }
}

// Load header on every page
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.loadComponent('header-container', 'components/header.html');
    ComponentLoader.loadComponent('footer-container', 'components/footer.html');
});