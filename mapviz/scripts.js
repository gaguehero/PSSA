let mapOptions = {
    center:[52.5002237, -2.94],
    zoom:10
}

var pointsForJson = [
    [5.58611, 43.296665],
    [5.614466, 43.190604],
    [5.565922, 43.254726],
    [5.376992, 43.302967]
  ];

let map = new L.map('map' , mapOptions);

pointsForJson.forEach(function(lngLat) {
    L.marker(lngLatToLatLng(lngLat)).addTo(map);
  });

var polyline = new L.polyline(lngLatArrayToLatLng(pointsForJson), {color: 'cyan'});
polyline.addTo(map);  

let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

map.fitBounds(polyline.getBounds());

function lngLatArrayToLatLng(lngLatArray) {
  return lngLatArray.map(lngLatToLatLng);
}

function lngLatToLatLng(lngLat) {
  return [lngLat[1], lngLat[0]];
}