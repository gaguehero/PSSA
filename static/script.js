let mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
let map = new L.map('map' , mapOptions);
let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

data = new FormData()
data.append('y','-25.3812036000')
data.append('x','-49.1992531000')

function lngLatArrayToLatLng(lngLatArray) {
    return lngLatArray.map(lngLatToLatLng);
}
  
function lngLatToLatLng(lngLat) {
    return [lngLat[1], lngLat[0]];
}
  
function getAmbulancia(){
    let url = "http://127.0.0.1:5000/test"
  
    //console.log(data)
    fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
      console.log(d)
      var nomes = [d[0].nome, 'Acidente', d[1][0].nome]
      pointsForJson = [
        [parseFloat(d[0].longeopoint),parseFloat(d[0].latgeopoint)],
        [-49.1992531000,-25.3812036000],
        [d[1][0].lng,d[1][0].lat]
      ]
      var ab = [
        [parseFloat(d[0].longeopoint),parseFloat(d[0].latgeopoint)],
        [-49.1992531000,-25.3812036000]
      ]
  
      var bc = [
        [-49.1992531000,-25.3812036000],
        [d[1][0].lng,d[1][0].lat]
      ]
  
      console.log(pointsForJson)
      i=-1;
      var geocodeService = L.esri.Geocoding.geocodeService({
        apikey: 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv' // replace with your api key - https://developers.arcgis.com
      });
      pointsForJson.forEach(function(lngLat) {
        i=i+1;
        geocodeService.reverse().latlng(lngLatToLatLng(lngLat)).run(function (error, result) {
            if (error) {
              return;
            }     
        L.marker(lngLatToLatLng(lngLat)).bindTooltip(result.address.Match_addr, 
        {
            permanent: true, 
            direction: 'right'
        }
        ).addTo(map);
    });
      })
      var polyline1 = new L.polyline(lngLatArrayToLatLng(ab), {color: 'red'});
      polyline1.bindTooltip("distance", 
      {
        permanent: true, 
        direction: 'right'
      } 
        ).addTo(map);
      var polyline2 = new L.polyline(lngLatArrayToLatLng(bc), {color: 'blue'});
      polyline2.addTo(map)
  
      map.fitBounds(polyline1.getBounds())

    })
}