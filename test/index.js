document.addEventListener('DOMContentLoaded', function () {
    const animationTab = document.getElementById('animation-tab');
    const visualizationTab = document.getElementById('visualization-tab');
    const animationContent = document.getElementById('animation-content');
    const visualizationContent = document.getElementById('visualization-content');
    const mapContainer = document.getElementById('map'); // Assuming the map container ID is 'map'

    // Show animation content and hide visualization content by default
    animationContent.style.display = 'block';
    visualizationContent.style.display = 'none';

    // Event listeners for tab clicks
    animationTab.addEventListener('click', function () {
        animationContent.style.display = 'block';
        visualizationContent.style.display = 'none';
        // Additional code to deactivate/hide the map in the animation tab if needed
        mapContainer.style.display = 'block'; // Show the map container if it was hidden
    });

    visualizationTab.addEventListener('click', function () {
        animationContent.style.display = 'none';
        visualizationContent.style.display = 'block';
        // Additional code to activate/show the map in the visualization tab if needed
        mapContainer.style.display = 'none'; // Hide the map container in the animation tab
    });
});
