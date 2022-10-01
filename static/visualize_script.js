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
      let helicopter = new L.Marker([pontos[0].lat,pontos[0].lng],markerOptions).addTo(map)


      customIcon = {
        iconUrl:"/static/imgs/hospital-building.png",
        iconSize:[40,40]
       }
      myIcon = L.icon(customIcon)
      markerOptions = {
        icon:myIcon,
        title:pontos[1].nome
      }
      let hospital =  new L.Marker([pontos[1].lat,pontos[1].lng],markerOptions).addTo(map)


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
        pontos[2].endereco,{permanent:true,direction:'right'}).addTo(map)


      drawLine(pontos[0],pontos[2],'blue',pontos[0].distancia)
      drawLine(pontos[2],pontos[1],'red',pontos[1].distancia)
      
      document.getElementById('busca').innerHTML = "<h2 id='h2viagem'>Dados da Viagem de Ida</h2>"+
      "<p> Selecione o trajeto a ser representado:<p>"+
      "<form id=selTrajeto><input type='radio' id='selTrajetoIda' name='selTrajeto' value='ida' checked>"+
      "<label for='selTrajetoIda'>Ida</label>"+
      "<input type='radio' id='selTrajetoVolta' name='selTrajeto' value='volta'>"+
      "<label for='selTrajetoVolta'>Volta</label></form>"+
      "<p><b>Código OACI:</b> "+pontos[1].codigo_oaci+"</p>"+
      "<p><b>Nome do Hospital:</b> "+pontos[1].nome+"</p>"+
      "<p><b>Distância: Acidente - Hospital:</b> "+pontos[1].distancia+"m</p>" +
      "<p><b>Altitude do Hospital:</b> "+pontos[1].altitude+"m</p>"+
      "<p><b>CRM do Socorrista:</b> "+pontos[0].crm+"</p>"+
      "<p><b>Endereço do Acidente:</b> "+pontos[2].endereco+"m</p>" +
      "<p><b>Distancia Heliporto - Acidente:</b> "+pontos[0].distancia+"m</p>"
      const selectForm = document.getElementById('selTrajeto')

      //Modificar os dados laterais
      selectForm.addEventListener('change',(event)=>{
        //alert('Teste')
        let trajetoValue = event.target.value
        console.log(trajetoValue)

      })
      })    
}

function drawLine(saida, chegada, color,dist){
  var polylinePoints = [
    [saida.lat, saida.lng],
    [chegada.lat, chegada.lng]
  ];            
  var polyline = L.polyline(polylinePoints, {color: color})
  polyline.bindTooltip(dist.toString(), {permanent: true, direction: 'right'}).addTo(map)

  map.fitBounds(polyline.getBounds())
}