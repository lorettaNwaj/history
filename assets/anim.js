mapboxgl.accessToken = 'pk.eyJ1Ijoibndhamlha3UiLCJhIjoiY2x3amphbXZ2MG02YTJscDRmcXE3MDllZCJ9.RwnwQjJ1U0Y95kTvA-4i7g'; // Replace with your Mapbox access token

const map = new mapboxgl.Map({
    container: 'map',
    style: {
        "version": 8,
        "sources": {
            "esriWorldPhysical": {
                "type": "raster",
                "tiles": [
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
                ],
                "tileSize": 256,
                "attribution": 'Esri, HERE, Garmin, FAO, NOAA, USGS, Intermap, METI, © OpenStreetMap contributors, and the GIS User Community'
            }
        },
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "layers": [
            {
                "id": "esriWorldPhysical-layer",
                "type": "raster",
                "source": "esriWorldPhysical",
                "minzoom": 0,
                "maxzoom": 22
            }
        ]
    },
    center: [-98.35, 39.50],
    zoom: 4
});

const shapefiles = {
    1800: 'states/states1800.json',
    1810: 'states/states1810.json',
    1820: 'states/states1820.json',
    1830: 'states/states1830.json',
    1840: 'states/states1840.json',
    1850: 'states/states1850.json',
    1860: 'states/states1860.json',
    1870: 'states/states1870.json',
    1880: 'states/states1880.json',
    1890: 'states/states1890.json',
    1900: 'states/state1900.geojson',
    1910: 'states/states1920.geojson'
};

const csvFiles = {
    1800: 'assets/flow/result_netflow_ratio18001809.csv',
    1810: 'assets/flow/result_netflow_ratio18101819.csv',
    1820: 'assets/flow/result_netflow_ratio18201829.csv',
    1830: 'assets/flow/result_netflow_ratio18301839.csv',
    1840: 'assets/flow/result_netflow_ratio18401849.csv',
    1850: 'assets/flow/result_netflow_ratio18501859.csv',
    1860: 'assets/flow/result_netflow_ratio18601869.csv',
    1870: 'assets/flow/result_netflow_ratio18701879.csv',
    1880: 'assets/flow/result_netflow_ratio18801889.csv',
    1890: 'assets/flow/result_netflow_ratio18901899.csv',
    1900: 'assets/flow/result_netflow_ratio19001909.csv',
    1910: 'assets/flow/result_netflow_ratio19201929.csv'
};

function getNameField(data) {
    const possibleFields = ['STATENAM', 'STATE_ABBR', 'LABEL'];
    const properties = data.features[0].properties;
    for (let field of possibleFields) {
        if (properties.hasOwnProperty(field)) {
            return field;
        }
    }
    return 'name'; // Fallback if no match is found
}

function getCentroid(geometry) {
    if (geometry.type === "Polygon") {
        return turf.centroid(geometry).geometry.coordinates;
    } else if (geometry.type === "MultiPolygon") {
        let largestPolygon = geometry.coordinates.reduce((a, b) => {
            return turf.area(turf.polygon(a)) > turf.area(turf.polygon(b)) ? a : b;
        });
        return turf.centroid(turf.polygon(largestPolygon)).geometry.coordinates;
    }
}

function prepareLabelData(data, nameField) {
    const labelFeatures = data.features.map(feature => {
        const centroid = getCentroid(feature.geometry);
        return {
            type: "Feature",
            properties: {
                name: feature.properties[nameField]
            },
            geometry: {
                type: "Point",
                coordinates: centroid
            }
        };
    });
    return {
        type: "FeatureCollection",
        features: labelFeatures
    };
}

function loadCSVData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load CSV file: ${url}`);
            }
            return response.text();
        })
        .then(csvText => {
            console.log('CSV Text:', csvText); // Log CSV text for debugging
            const parsedData = d3.csvParse(csvText, d => {
                d.rootsid = +d.rootsid; // Convert rootsid to number
                d.Netflow_Ratio = +d.Netflow_Ratio; // Convert Netflow_Ratio to number
                return d;
            });
            console.log('Parsed CSV Data:', parsedData); // Log parsed CSV data for debugging
            return parsedData;
        })
        .catch(error => console.error('Error loading CSV file:', error));
}

function mergeData(geojson, csvData) {
    const csvMap = new Map(csvData.map(row => [row.rootsid, row]));

    geojson.features.forEach(feature => {
        const csvRow = csvMap.get(feature.properties.rootsid);
        console.log('GeoJSON Feature:', feature);
        console.log('CSV Row:', csvRow); // Log csvRow variable
        if (csvRow) {
            feature.properties = { ...feature.properties, ...csvRow };
        }
    });

    return geojson;

}

function createColorScale(values) {
    const colorScheme = d3.schemeRdYlBu[5]; // ColorBrewer divergent color scheme
    const scale = d3.scaleQuantize()
        .domain(d3.extent(values.filter(v => v !== null))) // Filter out null values from the domain
        .range(colorScheme);
    return scale;
}
function loadShapefile(year) {
    const shapefileUrl = shapefiles[year];
    const csvUrl = csvFiles[year];

    console.log(`Loading shapefile from ${shapefileUrl}`);
    console.log(`Loading CSV data from ${csvUrl}`);

    Promise.all([fetch(shapefileUrl).then(response => response.json()), loadCSVData(csvUrl)])
        .then(([geojsonData, csvData]) => {
            const mergedData = mergeData(geojsonData, csvData);
            const nameField = getNameField(mergedData);
            const labelData = prepareLabelData(mergedData, nameField);

            const values = mergedData.features.map(feature => feature.properties.Netflow_Ratio).filter(v => v !== null && !isNaN(v));
            const colorScale = createColorScale(values);

            mergedData.features.forEach(feature => {
                if (feature.properties.Netflow_Ratio !== null) {
                    feature.properties.color = colorScale(feature.properties.Netflow_Ratio);
                } else {
                    feature.properties.color = 'green'; // Set default color for null values
                }
            });
            if (map.getSource('us-boundaries')) {
                map.getSource('us-boundaries').setData(mergedData);
                map.getSource('us-boundaries-labels').setData(labelData);
            } else {
                map.addSource('us-boundaries', {
                    type: 'geojson',
                    data: mergedData
                });
                map.addLayer({
                    id: 'us-boundaries-layer',
                    type: 'fill',
                    source: 'us-boundaries',
                    layout: {},
                    paint: {
                        'fill-color': ['get', 'color'],
                        'fill-outline-color': 'black'
                    }
                });
                map.addSource('us-boundaries-labels', {
                    type: 'geojson',
                    data: labelData
                });
                map.addLayer({
                    id: 'us-boundaries-labels-layer',
                    type: 'symbol',
                    source: 'us-boundaries-labels',
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'text-size': 10, // Increased font size
                        'text-transform': 'uppercase', // Changed text to uppercase
                        'text-letter-spacing': 0.05, // Added letter spacing
                        'text-offset': [0, 0.6],
                        'text-anchor': 'top'
                    },
                    paint: {
                        'text-color': 'black',
                        'text-halo-color': 'white', // Added halo color
                        'text-halo-width': 1 // Added halo width
                    }
                });
            }

            document.getElementById('year-label').textContent = `Year: ${year}`;
        })
        .catch(error => console.error('Error loading shapefile or CSV data:', error));
}
// Function to toggle the visibility of the legend
function toggleLegendVisibility(visible) {
    const legend = document.getElementById('map-legend');
    if (legend) {
        legend.style.display = visible ? 'block' : 'none';
    }
}

map.on('load', () => {
    loadShapefile(1800);

    document.getElementById('slider').addEventListener('input', function () {
        const year = this.value;
        loadShapefile(year);
    });

    // Example usage to show the legend
    toggleLegendVisibility(true);
});

// Get the legend element
const legend = document.querySelector('.map-legend');

// Variables to track mouse position and drag state
let isDragging = false;
let mouseX, mouseY;

// Function to handle mouse down event
function handleMouseDown(event) {
    isDragging = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    legend.style.cursor = 'grabbing'; // Change cursor style to grabbing
}

// Function to handle mouse move event
function handleMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        const rect = legend.getBoundingClientRect();
        legend.style.left = rect.left + deltaX + 'px';
        legend.style.top = rect.top + deltaY + 'px';
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
}

// Function to handle mouse up event
function handleMouseUp() {
    isDragging = false;
    legend.style.cursor = 'grab'; // Change cursor style back to grab
}

// Add event listeners
legend.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
