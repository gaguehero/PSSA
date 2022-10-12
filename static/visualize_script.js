chave = 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv'
mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
var estatisticas = []
const VELOCIDADE = 50

data = new FormData()
data.append('y','-25.3812036000')
data.append('x','-49.1992531000')

function startMap(){
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
}
  
function getAmbulancia(){
  //Endereço do acidente
  var geocodeService = L.esri.Geocoding.geocodeService({apikey: chave})
  geocodeService.reverse().latlng([-25.3812036000,-49.1992531000]).run(function (error, result)
  {
    if (error) 
    {
      return;
    }
    acidentSite = result.address.Match_addr
  })

  let url = "http://127.0.0.1:5000/test"  
  fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{

      //Recebe os 3 pontos
      pontos = 
      [
        {
          'type': 'Heliporto',
          'nome': d[1][0].nome,
          'lat': d[1][0].lat,
          'lng':d[1][0].lng,
          'distancia':(d[1][0].dist*100000).toFixed(2),
          'crm':d[1][0].crm
        },
        {
          'type':'Hospital',
          'nome':d[0].nome,
          'lat':parseFloat(d[0].latgeopoint),
          'lng':parseFloat(d[0].longeopoint),
          'distancia':(d[0].dist*100000).toFixed(2),
          'altitude':d[0].altitude,
          'codigo_oaci':d[0].codigo_oaci
        },
        {
          'type':'Acidente',
          'endereco': acidentSite,
          'lat': -25.3812036000,
          'lng': -49.1992531000
        }
      ]
      var active_polyline = L.featureGroup().addTo(map);

      //Colocando os 3 pontos no mapa
      let customIcon = {
        iconUrl:"/static/imgs/helicopter.png",
        iconSize:[40,40]
       }
      let myIcon = L.icon(customIcon)
      let markerOptions = {
        icon:myIcon,
        title:pontos[0].nome
      }
      let helicopter = new L.Marker([pontos[0].lat,pontos[0].lng],markerOptions).addTo(active_polyline)


      customIcon = {
        iconUrl:"/static/imgs/hospital-building.png",
        iconSize:[40,40]
       }
      myIcon = L.icon(customIcon)
      markerOptions = {
        icon:myIcon,
        title:pontos[1].nome
      }
      let hospital =  new L.Marker([pontos[1].lat,pontos[1].lng],markerOptions).bindTooltip(
        pontos[1].nome,{permanent:true,direction:'right'}).addTo(active_polyline)


      customIcon ={
        iconUrl:"/static/imgs/car-accident.png",
        iconSize:[40,40]
      }
      myIcon = L.icon(customIcon)
      markerOptions = {
        icon:myIcon,
        title:pontos[2].type
      }
      let acidente = new L.Marker([pontos[2].lat,pontos[2].lng],markerOptions).bindTooltip(
        pontos[2].endereco,{permanent:true,direction:'right'}).addTo(active_polyline)
      
      distha = drawLine(pontos[0],pontos[2],'blue',pontos[0].distancia, active_polyline, "yes")
      let timeHa = distha/VELOCIDADE 
      distah = drawLine(pontos[2],pontos[1],'red',pontos[1].distancia, active_polyline, "yes")
      let timeAh = distah/VELOCIDADE 
      drawCurvedLine(pontos[1],pontos[0],'green',pontos[1].distancia, active_polyline) 
      let timeReturn = timeAh+timeHa
      let distanciaIda = distha+distah
      document.getElementById('busca').innerHTML = "<h2 id='h2viagem'>Dados da Viagem</h2>"+
      "<p> Selecione o trajeto a ser representado:<p>"+
      "<form id=selTrajeto><input type='radio' id='selTrajetoIdaVolta' name='selTrajeto' value='idaevolta' checked>"+
      "<label for='selTrajetoIdaVolta'>Ida e Volta</label>"+
      "<form id=selTrajeto><input type='radio' id='selTrajetoIda' name='selTrajeto' value='ida'>"+
      "<label for='selTrajetoIda'>Ida</label>"+
      "<input type='radio' id='selTrajetoVolta' name='selTrajeto' value='volta'>"+
      "<label for='selTrajetoVolta'>Volta</label></form>"+

      "<p><b>CRM do Socorrista:</b> "+pontos[0].crm+"</p>"+

      "<p><b>Endereço do Acidente:</b> "+pontos[2].endereco+"m</p>"+
      "<p><b>Distancia Heliporto - Acidente:</b> "+distha+"m</p>"+
      "<p><b>Tempo Heliporto - Acidente:</b> "+timeHa.toFixed(2)+"s</p>"+

      "<p><b>Código OACI:</b> "+pontos[1].codigo_oaci+"</p>"+
      "<p><b>Nome do Hospital:</b> "+pontos[1].nome+"</p>"+
      "<p><b>Distância: Acidente - Hospital:</b> "+distah+"m</p>" +
      "<p><b>Tempo: Acidente - Hospital:</b> "+timeAh.toFixed(2)+"s</p>" +
      "<p><b>Altitude do Hospital:</b> "+pontos[1].altitude+"m</p>"+

      "<h3><b>Distância Total:</b> "+(distanciaIda*2)+"m</h3>" +
      "<h3><b>Tempo Total:</b> "+(timeReturn*2).toFixed(2)+"s</h3>" 

      const selectForm = document.getElementById('selTrajeto')

      //Modificar os dados laterais
      selectForm.addEventListener('change',(event)=>{
        let trajetoValue = event.target.value
        if(trajetoValue == "volta"){
          volta(active_polyline, hospital, helicopter)
        }
        if(trajetoValue == "ida"){
          ida(active_polyline, hospital, helicopter, acidente)
        }
        if(trajetoValue == "idaevolta"){
          idaevolta(active_polyline, hospital, helicopter, acidente)
        }
        console.log(trajetoValue)

      })
      })    
}

function drawLine(saida, chegada, color,dist,layer,bounds){
  var polylinePoints = [
    [saida.lat, saida.lng],
    [chegada.lat, chegada.lng]
  ];
  dist = (distance(saida.lat, chegada.lat, saida.lng, chegada.lng)*1000).toFixed(2)
  //dist = Math.round(dist)
  var polyline = L.polyline(polylinePoints, {color: color})
  polyline.bindTooltip(dist.toString()+" m", {permanent: true, direction: 'right'}).addTo(layer)
  if(bounds == "yes")
    map.fitBounds(polyline.getBounds())
  return dist
}

function drawCurvedLine(saida, chegada, color,dist,layer){
  var latlngs = [];

  var latlng1 = [saida.lat, saida.lng],
  latlng2 = [chegada.lat, chegada.lng];
  dist = distance(saida.lat, chegada.lat, saida.lng, chegada.lng)*1000
  dist = Math.round(dist)   
  var offsetX = latlng2[1] - latlng1[1],
  offsetY = latlng2[0] - latlng1[0];
  var r = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2)),
  theta = Math.atan2(offsetY, offsetX);   
  var thetaOffset = (3.14 / 10);
  var r2 = (r / 2) / (Math.cos(thetaOffset)),
  theta2 = theta + thetaOffset;
  var midpointX = (r2 * Math.cos(theta2)) + latlng1[1],
  midpointY = (r2 * Math.sin(theta2)) + latlng1[0];
  var midpointLatLng = [midpointY, midpointX];
  latlngs.push(latlng1, midpointLatLng, latlng2);
  var pathOptions = {
    color: color,
    weight: 3
  }
  
  var curvedPath = L.curve(
    [
      'M', latlng1,
      'Q', midpointLatLng,
      latlng2
    ], pathOptions).addTo(layer);
  var tooltip = L.tooltip()
    .setLatLng(midpointLatLng)
    .setContent(dist.toString()+" m", {permanent: true, direction: 'center'})
    .addTo(layer);
  }

function distance(lat1,
  lat2, lon1, lon2)
{

// The math module contains a function
// named toRadians which converts from
// degrees to radians.
lon1 =  lon1 * Math.PI / 180;
lon2 = lon2 * Math.PI / 180;
lat1 = lat1 * Math.PI / 180;
lat2 = lat2 * Math.PI / 180;

// Haversine formula
let dlon = lon2 - lon1;
let dlat = lat2 - lat1;
let a = Math.pow(Math.sin(dlat / 2), 2)
+ Math.cos(lat1) * Math.cos(lat2)
* Math.pow(Math.sin(dlon / 2),2);

let c = 2 * Math.asin(Math.sqrt(a));

// Radius of earth in kilometers. Use 3956
// for miles
let r = 6371;

// calculate the result
return(c * r);
}

function volta(layer, hospital, helicopter){
  layer.clearLayers();
  hospital.addTo(layer);
  helicopter.addTo(layer);
  drawLine(pontos[1],pontos[0],'blue',pontos[1].distancia, layer, "no")
}

function ida(layer, hospital, helicopter, acidente){
  layer.clearLayers();
  acidente.addTo(layer)
  hospital.addTo(layer);
  helicopter.addTo(layer);
  drawLine(pontos[2],pontos[1],'red',pontos[1].distancia, layer, "no") 
  drawLine(pontos[0],pontos[2],'blue',pontos[0].distancia, layer, "no")
}

function idaevolta(layer, hospital, helicopter, acidente){
  layer.clearLayers();
  acidente.addTo(layer)
  hospital.addTo(layer);
  helicopter.addTo(layer);
  drawLine(pontos[0],pontos[2],'blue',pontos[0].distancia, layer, "no")
  drawLine(pontos[2],pontos[1],'red',pontos[1].distancia, layer, "no") 
  drawCurvedLine(pontos[1],pontos[0],'green',pontos[1].distancia, layer)
}