// Assuming you have a Mapbox GL JS map instance named 'map'

// Add an event listener to detect map changes, such as when the slider value changes
document.getElementById('slider').addEventListener('input', function(event) {
    // Get the new slider value
    var year = event.target.value;
    
    // Update the year label
    document.getElementById('year-label').innerText = 'Year: ' + year;

    // Update the content of the text section based on the selected year
    updateTextContent(year);
});

// Function to update the text content based on the selected year
function updateTextContent(year) {
    var textSection = document.getElementById('text-section');

    switch (year) {
        case '1800':
            textSection.innerHTML = "<p>Content for 1800</p>";
            break;
        case '1810':
            textSection.innerHTML = "<p>Content for 1810</p>";
            break;
        case '1820':
            textSection.innerHTML = "<p>Content for 1820</p>";
            break;
        case '1830':
            textSection.innerHTML = "<p>Content for 1830</p>";
            break;
        case '1840':
            textSection.innerHTML = "<p>Content for 1840</p>";
            break;  
        case '1850':
            textSection.innerHTML = "<p>Content for 1850</p>";
            break;  
        case '1860':
            textSection.innerHTML = "<p>Content for 1860</p>";
            break;       
        case '1870':
             textSection.innerHTML = "<p>Content for 1870</p>";
            break;
        case '1880':
            textSection.innerHTML = "<p>Content for 1880</p>";
            break;
        case '1890':
            textSection.innerHTML = "<p>Content for 1890</p>";
            break;
        case '1900':
            textSection.innerHTML = "<p>Content for 1900</p>";
            break;
        case '1910':
            textSection.innerHTML = "<p>Content for 1910</p>";
            break;
        // Add cases for other years as needed
        default:
            textSection.innerHTML = " ";
    }
}
