chave = 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv'
mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
const NOMINATIM = 'https://nominatim.openstreetmap.org/search?'
const VELOCIDADE = 50

let toggleHelicopter = 1
let toggleHospital = 1

var helicopterMarkers = new Array();
var hospitalMarkers = new Array();

function startMap(){
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
}

function searchAddress(){
    let enderecoSearch = document.getElementById('endereco').value
    console.log(enderecoSearch)
    textSearch = enderecoSearch.replace(' ','+')
    
    let number = document.getElementById('numero').value
    let cidade = document.getElementById('cidade').value

    textSearch =number + "+" + enderecoSearch.replace(' ','+') + "+" + cidade

    let address = NOMINATIM + "q=" + textSearch + "&countrycodes=br&format=geojson&limit=1"
    fetch(address,{"method":"GET"}).then(r=>r.json()).then(d=>{
        data = d.features[0]
        console.log(data.geometry.coordinates)

        customIcon ={
            iconUrl:"/static/imgs/car-accident.png",
            iconSize:[40,40]
          }
          myIcon = L.icon(customIcon)
          markerOptions = {
            icon:myIcon,
            title:data.properties.display_name
          }
        geoAcidente = [data.geometry.coordinates[1],data.geometry.coordinates[0]]
        let acidente = new L.Marker(geoAcidente,markerOptions).addTo(map)
        getHelicopters(geoAcidente)
    })
}

function getHelicopters(geoAcidente){
    helicopterMarkers.length = 0
    let url = "http://127.0.0.1:5000/heliport"  
    data = new FormData()
    data.append('x',geoAcidente[1])
    data.append('y',geoAcidente[0])
    fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
        let data = d[0]
        console.log(data)

        let div = document.getElementById('heliportSel')
        div.innerHTML =''

        let selecioneHeli = document.createElement('span')
        selecioneHeli.innerHTML = "Selecione o heliporto "
        selecioneHeli.setAttribute('class','gaveta')
        selecioneHeli.setAttribute('id','gavetaHelicopter')
        selecioneHeli.addEventListener('click', toogleVisibility,'false')
        div.appendChild(selecioneHeli)

        let icon = document.createElement('img')
        icon.setAttribute('src','/static/imgs/angle-arrow-down.png')
        icon.style.width='20px'
        icon.setAttribute('id','arrowHelicopter')
        selecioneHeli.appendChild(icon)

        let tabela = document.createElement('table')
        tabela.setAttribute('id','optionsHelicopters')
        tabela.style.display = "none"
        div.appendChild(tabela)

        let cabecalho = document.createElement('tr')

        let atributo = document.createElement('th')
        cabecalho.appendChild(atributo)

        let atributoEnd = document.createElement('th')
        atributoEnd.innerText = 'Endereço'
        cabecalho.appendChild(atributoEnd)

        let atributoOACI = document.createElement('th')
        atributoOACI.innerHTML = 'OACI'
        cabecalho.appendChild(atributoOACI)

        let atributoDist = document.createElement('th')
        atributoDist.innerHTML =  'Distancia'
        cabecalho.appendChild(atributoDist)
        tabela.appendChild(cabecalho)

        for(let i = 0;i<data.length;i++){
            let option = document.createElement('tr')
            option.setAttribute('id','heliport'+i)

            let selectorData = document.createElement('td')
            let selector = document.createElement('input')
            selector.setAttribute('type','radio')
            selector.setAttribute('id','sel'+i)
            selector.setAttribute('name','selradioHeliport')
            selector.setAttribute('value',i)
            selectorData.appendChild(selector)
            option.appendChild(selectorData)
            placeTemporaryMarker(data[i].latgeopoint,data[i].longeopoint,'helicopter')
            map.addLayer(helicopterMarkers[i])

            let nome = document.createElement('td')
            nome.innerText = data[i].nome
            option.appendChild(nome)

            let oaci = document.createElement('td')
            oaci.innerText = data[i].codigo_oaci
            option.appendChild(oaci)

            let distancia = document.createElement('td')
            distMeters = distance(geoAcidente[0],data[i].latgeopoint,geoAcidente[1],data[i].longeopoint)
            distancia.innerText = (distMeters*1000).toFixed(2) + 'm'
            option.appendChild(distancia)

            tabela.appendChild(option)

        }
        let horizontalLine = document.createElement('hr')
        div.appendChild(horizontalLine)
    })

}

function getHospitals(geoAcidente){

}

function placeTemporaryMarker(lat,long,type){
    if(type =='helicopter'){
        var tempMarker = new L.marker([lat, long]);
        helicopterMarkers.push(tempMarker)
    }
}


function toogleVisibility(evt){
    let option
    let clicado = evt.currentTarget.id
    if(clicado == 'gavetaHelicopter'){
        document.getElementById('arrowHelicopter').style.transform = 'rotate('+180*toggleHelicopter+'deg)';
        toggleHelicopter = !toggleHelicopter
        option = document.getElementById('optionsHelicopters')
    }
    if(clicado=='gavetaHospital'){
        document.getElementById('arrowHospital').style.transform = 'rotate('+180*toggleHospital+'deg)';
        toggleHospital = !toggleHospital
        option = document.getElementById('optionsHospital')
    }

    if(option.style.display=='none')
        option.style.display = 'block'
    else 
        option.style.display = 'none'
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