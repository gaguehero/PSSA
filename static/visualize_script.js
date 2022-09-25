chave = 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv'
mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
var estatisticas = []


data = new FormData()
data.append('y','-25.3812036000')
data.append('x','-49.1992531000')

function startMap(){
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
}

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
      //console.log(d)
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
      estatisticas.push(d[0].codigo_oaci)
      estatisticas.push(d[0].altitude)
      estatisticas.push(d[1][0].crm)
      console.log(pointsForJson)
      i=-1;
      var geocodeService = L.esri.Geocoding.geocodeService({
        apikey: chave
      });
      //Colocando os 3 pontos no mapa
      let customIcon = {
        iconUrl:"/static/imgs/helicopter.png",
        iconSize:[30,30]
       }
      let myIcon = L.icon(customIcon)

      
      let markerOptions = {
        icon:myIcon,
        title:nomes[2]
      }
      let helicopter = new L.Marker(lngLatToLatLng(pointsForJson[2]),markerOptions)

      customIcon = {
        iconUrl:"/static/imgs/hospital-building.png",
        iconSize:[30,30]
       }
      myIcon = L.icon(customIcon)
      markerOptions = {
        icon:myIcon,
        title:nomes[0]
      }
      let hospital =  new L.Marker(lngLatToLatLng(pointsForJson[0]),markerOptions)

      geocodeService.reverse().latlng(lngLatToLatLng(pointsForJson[1])).run(function (error, result){
        if (error) {
          return;
        }
        customIcon = {
          iconUrl:"/static/imgs/car-accident.png",
          iconSize:[30,30]
        }
        myIcon = L.icon(customIcon)
        markerOptions={
          icon:myIcon,
          title:'Local do Acidente'
        }
        let acidente = new L.Marker(lngLatToLatLng(pointsForJson[1]),markerOptions).bindTooltip(result.address.Match_addr, 
          {
            permanent: true, 
            direction: 'right'
          }).addTo(map)
      })


      url = "http://127.0.0.1:5000/getDistance"
      let points = new FormData()
      points.append('y1',pointsForJson[1][1])
      points.append('x1',pointsForJson[1][0])
      points.append('y2',pointsForJson[2][1])
      points.append('x2',pointsForJson[2][0])
      fetch(url,{"method":"POST","body":points}).then(r=>r.json()).then(d=>
      {
        console.log(d.st_distance)
        let legenda = (d.st_distance*10000).toFixed(2).toString()
        estatisticas.push(legenda)
        console.log(legenda)
        var polyline = new L.polyline(lngLatArrayToLatLng(bc), {color: 'blue'});
        polyline.bindTooltip(legenda, 
        {
          permanent: true, 
          direction: 'right'
        }).addTo(map)
        points = new FormData()
      points.append('y1',pointsForJson[1][1])
      points.append('x1',pointsForJson[1][0])
      points.append('y2',pointsForJson[0][1])
      points.append('x2',pointsForJson[0][0])
      fetch(url,{"method":"POST","body":points}).then(r=>r.json()).then(d=>
      {
        console.log(d.st_distance)
        let legenda = (d.st_distance*10000).toFixed(2).toString()
        estatisticas.push(legenda)
        console.log(legenda)
        var polyline = new L.polyline(lngLatArrayToLatLng(ab), {color: 'red'});
        polyline.bindTooltip(legenda, 
        {
          permanent: true, 
          direction: 'right'
        }).addTo(map)
        map.fitBounds(polyline.getBounds())
        console.log(estatisticas)
        let distancia = parseFloat(estatisticas[3])+parseFloat(estatisticas[4])
        document.getElementById('busca').innerHTML = "<h2>Dados da Busca</h2>"+
        "<p><b>Código OACI:</b> "+estatisticas[0]+"</p>"+
        "<p><b>Nome do Hospital:</b> "+nomes[0]+"</p>"+
        "<p><b>Altitude do Hospital:</b> "+estatisticas[1]+"m</p>"+
        "<p><b>CRM do Socorrista:</b> "+estatisticas[2]+"</p>"+
        "<p><b>Distancia percorrida:</b> "+distancia+"m</p>"
      })
      })
      
      hospital.addTo(map)
      helicopter.addTo(map)     
    })
    
}