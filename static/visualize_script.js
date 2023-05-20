chave = 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv'
mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
var estatisticas = []
var acidentSite
const VELOCIDADE = 66.67
var id = new Array()
var oldSelAcc = ''
var pontos
var accidentMarkers = new Array();

// data = new FormData()
// data.append('x','-49.1992531000')
// data.append('y','-25.3812036000')

function formatHora(segs){
  console.log("Segundos sem format:" + segs)
  let horas, minutos, segundos
  if(segs>60){
    horas = 0
    minutos =  Math.round(segs/60)
    segundos = Math.round(segs%60)
    if (segundos<10)
      segundos = '0'+segundos
    if(minutos>60){
      horas = Math.round(minutos/60)
      minutos = minutos%60
      if(minutos<10)
        minutos = '0'+minutos
      return horas + ':' + minutos +':' + segundos
    }
    if(minutos<10)
        minutos = '0'+minutos
    return "00:" + minutos +':' + segundos
  }
  segundos = Math.round(segs)
  if(segs>10)
    segundos = '0'+segundos
  return '00:00:'+segundos
}



function startMap(){
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
}
function selOccurrence(){
  let dataSearch = document.getElementById('dIni').value
  let idSearch = document.getElementById('id').value
  let url = "http://127.0.0.1:5000/selOcc"
  data = new FormData()
  data.append('date',dataSearch)
  if(idSearch)
    data.append('id',idSearch)
  fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
    let data = d
    console.log(data)
    
    let div = document.getElementById('occSel')
    div.innerHTML =''

    let selecioneAc = document.createElement('h2')
    selecioneAc.innerHTML = "Selecione o acidente"
    div.appendChild(selecioneAc)

    let tabela = document.createElement('table')
    tabela.setAttribute('id','optionsAccidentess')
    div.appendChild(tabela)

    let cabecalho = document.createElement('tr')

    let atributo = document.createElement('th')
    cabecalho.appendChild(atributo)

    atributo = document.createElement('th')
    atributo.innerText = 'ID'
    cabecalho.appendChild(atributo)

    atributo = document.createElement('th')
    atributo.innerHTML = 'ID Acidente'
    cabecalho.appendChild(atributo)

    atributo = document.createElement('th')
    atributo.innerHTML =  'CRM'
    cabecalho.appendChild(atributo)
    tabela.appendChild(cabecalho)

    atributo = document.createElement('th')
    atributo.innerHTML =  'Codigo OACI'
    cabecalho.appendChild(atributo)
    tabela.appendChild(cabecalho)

    for(let i = (Object.keys(data).length/2)-1; i>=0;i--){
        j = Object.keys(data).length-1
        console.log(i , j)
        let option = document.createElement('tr')
        option.setAttribute('id','accident'+i)

        let selectorData = document.createElement('td')
        let selector = document.createElement('input')
        selector.setAttribute('type','radio')
        selector.setAttribute('id','acciSel'+i)
        selector.setAttribute('name','selradioAcci')
        selector.setAttribute('value',i)
        selector.setAttribute('onchange','handleSelAcci('+i+')')
        selectorData.appendChild(selector)
        option.appendChild(selectorData)

        let iconURL = "/static/imgs/unsel_car-accident.png"
        placeTemporaryMarker(data[j]['latitude'],data[j]['longitude'],accidentMarkers,iconURL,data[i]['id_acidente'])

        let id_ocorrencia = document.createElement('td')
        id_ocorrencia.innerText = data[i]['id_ocorrencia']
        id.push(data[i]['id_ocorrencia'])
        option.appendChild(id_ocorrencia)

        let id_acidente = document.createElement('td')
        id_acidente.innerText = data[i]['id_acidente']
        option.appendChild(id_acidente)

        let crm = document.createElement('td')
        crm.innerText = data[i]['crm']
        option.appendChild(crm)

        let oaci = document.createElement('td')
        oaci.innerText = data[i]['codigo_oaci']
        option.appendChild(oaci)

        tabela.appendChild(option)
        j--
    }
    //<button onclick="selectAcc()" id="selectAcc">Confirmar</button>
    let button = document.createElement('button')
    button.innerText = 'Confirm'
    button.setAttribute('id', 'selectAcc')
    button.setAttribute('onclick','selectAcc()')
    div.appendChild(button)
    centerLeafletMapOnMarker(map,accidentMarkers)
})
}

function placeTemporaryMarker(lat,long,array,iconURL,name){
  let customIcon ={
      iconUrl:iconURL,
      iconSize:[40,40]
      }
  let myIcon = L.icon(customIcon)
  let markerOptions = {
      icon:myIcon,
      title:name
  }
  lat = parseFloat(lat)
  long = parseFloat(long)
  console.log(lat, long)
  var tempMarker = new L.marker([lat, long],markerOptions).addTo(map);
  array.push(tempMarker)
  
}

function centerLeafletMapOnMarker(map, markers, accident=0) {
  var latLngs = []
  for(let i = 0; i<markers.length;i++){
      latLngs[i] = markers[i].getLatLng()
  }
  if(accident)
      latLngs.push(accident)
  var markerBounds = L.latLngBounds(latLngs);
  map.fitBounds(markerBounds);
}


function selectAcc(){
  for(let i = 0;i<accidentMarkers.length;i++){
      let selector = document.getElementById('acciSel'+i)
      if(selector.classList.contains('selected')){
          selectedId = id[i]
      }
      else
          map.removeLayer(accidentMarkers[i])
  }

  let div = document.getElementById('occSel')
  div.remove()
    
  console.log(selectedId)
  getAmbulancia(selectedId)
}

function handleSelAcci(number){
  //map.removeLayer(helicopterMarkers[number])
  let customIcon = {
      iconUrl:"/static/imgs/car-accident.png",
      iconSize:[40,40]
     }
  
  let newIcon = L.icon(customIcon)
  accidentMarkers[number].setIcon(newIcon)
  let selector = document.getElementById("acciSel"+number)
  selector.classList.add("selected");

  if(oldSelAcc!==''){
      customIcon = {
          iconUrl:"/static/imgs/unsel_car-accident.png",
          iconSize:[40,40]
      }
      newIcon = L.icon(customIcon)
      accidentMarkers[oldSelAcc].setIcon(newIcon)
      selector = document.getElementById('acciSel'+oldSelAcc)
      selector.classList.remove("selected")
  }
  oldSelAcc = number
}

function getAmbulancia(selectedId){
  data = new FormData()
  data.append('id',selectedId)
  let url = "http://127.0.0.1:5000/visualizaAcidente"  
  fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
      //Recebe os 3 pontos
      var geocodeService = L.esri.Geocoding.geocodeService({apikey: chave})
      geocodeService.reverse().latlng([d[0]["latitude"],d[0]["longitude"]]).run(function (error, result)
      {
        if (error) 
        {
          return;
        }
        acidentSite = result.address.Match_addr
        console.log(acidentSite)
      })
      let data = d[0]
      console.log(data)

      setTimeout(() => { 
      pontos = 
      [
        {
          'type': 'Heliporto',
          'nome': d[2][0].nome,
          'lat': d[2][0].lat,
          'lng':d[2][0].lng,
          'distancia':(d[2][0].dist*100000).toFixed(2),
          'crm':d[2][0].crm
        },
        {
          'type':'Hospital',
          'nome':d[1][0].nome,
          'lat':parseFloat(d[1][0].latgeopoint),
          'lng':parseFloat(d[1][0].longeopoint),
          'distancia':(d[1][0].dist*100000).toFixed(2),
          'altitude':d[1][0].altitude,
          'codigo_oaci':d[1][0].codigo_oaci
        },
        {
          'type':'Acidente',
          'endereco': acidentSite,
          'lat': parseFloat(d[0]["latitude"]),
          'lng': parseFloat(d[0]['longitude'])
        }
      ]
      console.log(pontos[2].endereco)
      console.log(acidentSite)
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
      let timeHaFormatado =  formatHora(timeHa)
      distah = drawLine(pontos[2],pontos[1],'red',pontos[1].distancia, active_polyline, "yes")
      let timeAh = distah/VELOCIDADE 
      console.log('chamando formatHora')
      let timeAhFormatado = formatHora(timeAh)
      drawCurvedLine(pontos[1],pontos[0],'green',pontos[1].distancia, active_polyline) 
      let timeTotal = (timeAh+timeHa)*2
      let timeReturnFormatado = formatHora(timeTotal)
      distha = parseFloat(distha)
      distah = parseFloat(distah)
      let distanciaIda = distha+distah
      console.log(typeof distha)


      document.getElementById('busca').innerHTML = "<h2 id='h2viagem'>Travel data</h2>"+
      "<p> Select the Route:<p>"+
      "<form id=selTrajeto><input type='radio' id='selTrajetoIdaVolta' name='selTrajeto' value='idaevolta' checked>"+
      "<label for='selTrajetoIdaVolta'>Full Route</label>"+
      "<form id=selTrajeto><input type='radio' id='selTrajetoIda' name='selTrajeto' value='ida'>"+
      "<label for='selTrajetoIda'>Outward Route</label>"+
      "<input type='radio' id='selTrajetoVolta' name='selTrajeto' value='volta'>"+
      "<label for='selTrajetoVolta'>Return</label></form>"+

      "<p><b>Rescuer CRM:</b> "+pontos[0].crm+"</p>"+

      "<p><b>Accident Address:</b> "+pontos[2].endereco+"m</p>"+
      "<p><b>Distance Heliport - Accident:</b> "+distha+"m</p>"+
      "<p><b>Travel Time Heliport - Accident:</b> "+timeHaFormatado+"</p>"+

      "<p><b>OACI Code:</b> "+pontos[1].codigo_oaci+"</p>"+
      "<p><b>Hospital Name:</b> "+pontos[1].nome+"</p>"+
      "<p><b>Distance: Accident - Hospital:</b> "+distah+"m</p>" +



      "<p><b>Travel Time: Accident - Hospital:</b> "+timeAhFormatado+"</p>" +
      "<p><b>Hospital Altitude:</b> "+pontos[1].altitude+"m</p>"+

      "<h3><b>Total Distance:</b> "+(distanciaIda*2).toFixed(2)+"m</h3>" +
      "<h3><b>Total Travel Time:</b> "+timeReturnFormatado+"</h3>"

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
      ;}, 1000);
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

function waitForElement(){
  if(typeof acidentSite !== "undefined"){
      console.log(typeof acidentSite)
  }
  else{
      setTimeout(waitForElement, 250);
  }
}