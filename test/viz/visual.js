// Function to generate centroids for polygons in GeoJSON
function generateCentroids(geojson) {
    // Iterate through each feature (polygon) in the GeoJSON data
    geojson.features.forEach(function(feature) {
        // Check if the feature is a Polygon or MultiPolygon
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            // Calculate the centroid using Turf.js
            const centroid = turf.centroid(feature);
            // Add the centroid as a new point feature to the GeoJSON data
            centroid.properties = {}; // You can add properties if needed
            geojson.features.push(centroid);
        }
    });
    return geojson;
}

mapboxgl.accessToken = 'pk.eyJ1Ijoibndhamlha3UiLCJhIjoiY2x3amphbXZ2MG02YTJscDRmcXE3MDllZCJ9.RwnwQjJ1U0Y95kTvA-4i7g';

const visualizationMap = new mapboxgl.Map({
    container: 'visualization-container',
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

// Load GeoJSON data using D3
d3.json('states/states1810.json').then(function(data) {
    // Generate centroids for polygons in the GeoJSON data
    const dataWithCentroids = generateCentroids(data);

    // Add GeoJSON source to the map for polygons
    visualizationMap.addSource('customGeoJSON', {
        'type': 'geojson',
        'data': dataWithCentroids
    });

    // Add a new layer to the map for polygons
    visualizationMap.addLayer({
        'id': 'customGeoJSON-layer',
        'type': 'fill', // Change type based on your GeoJSON data type
        'source': 'customGeoJSON',
        'paint': {
            'fill-color': 'grey', // Dark gray color with 70% opacity
            'fill-outline-color': 'black'
        }
    });

    // Add a layer for centroid points
    visualizationMap.addLayer({
        'id': 'centroid-points',
        'type': 'circle',
        'source': 'customGeoJSON',
        'filter': ['==', '$type', 'Point'],
        'paint': {
            'circle-radius': 3,
            'circle-color': 'black'
        }
    });
}).catch(function(error) {
    console.log('Error loading GeoJSON data:', error);
});
