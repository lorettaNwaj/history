 // Your animation JavaScript code here
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

 function loadShapefile(year) {
     const url = shapefiles[year];
     fetch(url)
         .then(response => response.json())
         .then(data => {
             const nameField = getNameField(data);
             const labelData = prepareLabelData(data, nameField);
             if (map.getSource('us-boundaries')) {
                 map.getSource('us-boundaries').setData(data);
                 map.getSource('us-boundaries-labels').setData(labelData);
             } else {
                 map.addSource('us-boundaries', {
                     type: 'geojson',
                     data: data
                 });
                 map.addLayer({
                     id: 'us-boundaries-layer',
                     type: 'fill',
                     source: 'us-boundaries',
                     layout: {},
                     paint: {
                         'fill-color': 'lightgrey', // Changed fill color to light grey
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
                         'text-halo-width': 2 // Added halo width
                     }
                 });
             }
             document.getElementById('year-label').textContent = `Year: ${year}`;
         })
         .catch(error => console.error('Error loading shapefile:', error));
 }

 map.on('load', () => {
     loadShapefile(1800);

     document.getElementById('slider').addEventListener('input', function () {
         const year = this.value;
         loadShapefile(year);
     });
 });