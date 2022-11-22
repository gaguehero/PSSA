chave = 'AAPK756a7313b9a2467db4b9e0d7f2e9e314SLezb_HzKBlVANq_HXbWtapWhbNrcXNucpWCER_hGuDkwcom6Ps4lSAKy8KiNacv'
mapOptions = {
    center:[-25.43919, -49.26933],
    zoom:12
}
const NOMINATIM = 'https://nominatim.openstreetmap.org/search?'
const VELOCIDADE = 50

let toggleHelicopter = 1
let toggleHospital = 1
var oldSelHeli = ''
var oldSelHosp = ''
var codigo_oaci = new Array();
var codigo_crm = new Array();


var helicopterMarkers = new Array();
var hospitalMarkers = new Array();
var accidentMarkers = new Array();

function startMap(){
    map = new L.map('map' , mapOptions);
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    map.addLayer(layer);
}

function searchAccident(){
    let dataSearch = document.getElementById('dia').value
    let idSearch = document.getElementById('id').value
    let cidadeSearch = document.getElementById('cidade').value
    let url = "http://127.0.0.1:5000/accident"
    data = new FormData()
    data.append('date',dataSearch)
    if(idSearch)
        data.append('id',idSearch)
    if(cidadeSearch)
        data.append('cidade',cidadeSearch)
    fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
        let data = d[0]
        console.log(data)
        
        let div = document.getElementById('accidentSel')
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
        atributo.innerHTML = 'Horário'
        cabecalho.appendChild(atributo)

        atributo = document.createElement('th')
        atributo.innerHTML =  'Município'
        cabecalho.appendChild(atributo)
        tabela.appendChild(cabecalho)

        atributo = document.createElement('th')
        atributo.innerHTML =  'Meteorologia'
        cabecalho.appendChild(atributo)
        tabela.appendChild(cabecalho)

        for(let i = 0; i<data.length;i++){
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
            placeTemporaryMarker(data[i].latitude,data[i].longitude,accidentMarkers,iconURL,data[i].id_acidente)

            let id_acidente = document.createElement('td')
            id_acidente.innerText = data[i].id_acidente
            option.appendChild(id_acidente)

            let horario = document.createElement('td')
            horario.innerText = data[i].horario
            option.appendChild(horario)

            let municipio = document.createElement('td')
            municipio.innerText = data[i].municipio.trim()
            option.appendChild(municipio)

            let meteorologia = document.createElement('td')
            meteorologia.innerText = data[i].condicao_meteorologica.trim()
            option.appendChild(meteorologia)

            tabela.appendChild(option)

        }
    })
}

function searchAddress(){
    let enderecoSearch = document.getElementById('endereco').value
    console.log(enderecoSearch)
    textSearch = enderecoSearch.replace(' ','+')
    
    let number = document.getElementById('numero').value
    let cidade = document.getElementById('cidade').value

    textSearch =number + "+" + enderecoSearch.replace(' ','+') + "+" + cidade

    let address = NOMINATIM + "q=" + textSearch + "&countrycodes=br&format=geojson&limit=1"
    map.setZoom(14)
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
        acidente = new L.Marker(geoAcidente,markerOptions).addTo(map)
        getHelicopters(geoAcidente)
        getHospitals(geoAcidente)
    })
}

function postOccurence(id_ocorrencia, id_acidente, id_plano_voo, oacipass, crmpass, data_hora, cod_medico, cod_amb_area){
    helicopterMarkers.length = 0
    let url = "http://127.0.0.1:5000/ocorrencia"  
    data = new FormData()
    data.append('id_ocorrencia', id_ocorrencia)
    data.append('id_acidente', id_acidente)
    data.append('id_plano_voo', id_plano_voo)
    data.append('codigo_oaci', oacipass)
    data.append('crm', crmpass)
    data.append('data_hora', data_hora)
    data.append('cod_medico',cod_medico)
    data.append('cod_amb_geral',cod_amb_area)
    fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
        let data = d[0]
        console.log(data)
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
            selector.setAttribute('id','heliSel'+i)
            selector.setAttribute('name','selradioHeliport')
            selector.setAttribute('value',i)
            selector.setAttribute('onchange','handleSelHeliport('+i+')')
            selectorData.appendChild(selector)
            option.appendChild(selectorData)

            let iconURL = "/static/imgs/unsel_helicopter.png"
            placeTemporaryMarker(data[i].latgeopoint,data[i].longeopoint,helicopterMarkers,iconURL,data[i].nome)
            //map.addLayer(helicopterMarkers[i])

            let nome = document.createElement('td')
            nome.innerText = data[i].nome
            option.appendChild(nome)

            let oaci = document.createElement('td')
            oaci.innerText = data[i].codigo_oaci
            option.appendChild(oaci)
            codigo_oaci.push(data[i].codigo_oaci)

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

function handleSelHeliport(number){
    //map.removeLayer(helicopterMarkers[number])
    let customIcon = {
        iconUrl:"/static/imgs/helicopter.png",
        iconSize:[40,40]
       }
    
    let newIcon = L.icon(customIcon)
    helicopterMarkers[number].setIcon(newIcon)
    let selector = document.getElementById("heliSel"+number)
    selector.classList.add("selected");

    if(oldSelHeli!==''){
        customIcon = {
            iconUrl:"/static/imgs/unsel_helicopter.png",
            iconSize:[40,40]
        }
        newIcon = L.icon(customIcon)
        helicopterMarkers[oldSelHeli].setIcon(newIcon)
        selector = document.getElementById('heliSel'+oldSelHeli)
        selector.classList.remove("selected")
    }
    oldSelHeli = number
}

function getHospitals(geoAcidente){
    data = new FormData()
    data.append('x',geoAcidente[1])
    data.append('y',geoAcidente[0])
    url = 'http://127.0.0.1:5000/hospital'
    fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
        let data = d[0]
        console.log(data)

        let div = document.getElementById('hospitalSel')
        div.innerHTML =''

        let selecioneHeli = document.createElement('span')
        selecioneHeli.innerHTML = "Selecione o hosptial "
        selecioneHeli.setAttribute('class','gaveta')
        selecioneHeli.setAttribute('id','gavetaHospital')
        selecioneHeli.addEventListener('click', toogleVisibility,'false')
        div.appendChild(selecioneHeli)

        let icon = document.createElement('img')
        icon.setAttribute('src','/static/imgs/angle-arrow-down.png')
        icon.style.width='20px'
        icon.setAttribute('id','arrowHospital')
        selecioneHeli.appendChild(icon)

        let tabela = document.createElement('table')
        tabela.setAttribute('id','optionsHospital')
        tabela.style.display = "none"
        div.appendChild(tabela)

        let cabecalho = document.createElement('tr')

        let atributo = document.createElement('th')
        cabecalho.appendChild(atributo)

        let atributoEnd = document.createElement('th')
        atributoEnd.innerText = 'Nome'
        cabecalho.appendChild(atributoEnd)

        let atributoOACI = document.createElement('th')
        atributoOACI.innerHTML = 'CRM'
        cabecalho.appendChild(atributoOACI)

        let atributoDist = document.createElement('th')
        atributoDist.innerHTML =  'Distancia'
        cabecalho.appendChild(atributoDist)
        tabela.appendChild(cabecalho)
        for(let i = 0;i<data.length;i++){
            let option = document.createElement('tr')
            option.setAttribute('id','hospital'+i)

            let selectorData = document.createElement('td')
            let selector = document.createElement('input')
            selector.setAttribute('type','radio')
            selector.setAttribute('id','hospSel'+i)
            selector.setAttribute('name','selradioHospital')
            selector.setAttribute('value',i)
            selector.setAttribute('onchange','handleSelHospital('+i+')')
            selectorData.appendChild(selector)
            option.appendChild(selectorData)

            let iconURL = "/static/imgs/unsel_hospital-building.png"
            console.log(data[i].lat + ' - ' + data[i].lng)
            placeTemporaryMarker(data[i].lat,data[i].lng,hospitalMarkers,iconURL,data[i].nome)
            //map.addLayer(hospitalMarkers[i])

            let nome = document.createElement('td')
            nome.innerText = data[i].nome
            option.appendChild(nome)

            let crm = document.createElement('td')
            crm.innerText = data[i].crm
            option.appendChild(crm)
            codigo_crm.push(data[i].crm)

            let distancia = document.createElement('td')
            distMeters = distance(geoAcidente[0],data[i].lat,geoAcidente[1],data[i].lng)
            distancia.innerText = (distMeters*1000).toFixed(2) + 'm'
            option.appendChild(distancia)

            tabela.appendChild(option)

        }
        let horizontalLine = document.createElement('hr')
        div.appendChild(horizontalLine)
        let button = document.getElementById('traceRoute')
        button.style.display = 'block'
    })
}

function handleSelHospital(number){
    //map.removeLayer(helicopterMarkers[number])
    let customIcon = {
        iconUrl:"/static/imgs/hospital-building.png",
        iconSize:[40,40]
       }
    
    let newIcon = L.icon(customIcon)
    hospitalMarkers[number].setIcon(newIcon)
    let selector = document.getElementById("hospSel"+number)
    selector.classList.add("selected");

    if(oldSelHosp!==''){
        customIcon = {
            iconUrl:"/static/imgs/unsel_hospital-building.png",
            iconSize:[40,40]
        }
        newIcon = L.icon(customIcon)
        hospitalMarkers[oldSelHosp].setIcon(newIcon)
        selector = document.getElementById('hospSel'+oldSelHosp)
        selector.classList.remove("selected")
    }
    oldSelHosp = number
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
    console.log(typeof(lat), typeof(long))
    var tempMarker = new L.marker([lat, long],markerOptions);
    array.push(tempMarker)
    
}


function toogleVisibility(evt){
    let option
    let clicado = evt.currentTarget.id
    if(clicado == 'gavetaHelicopter'){
        document.getElementById('arrowHelicopter').style.transform = 'rotate('+180*toggleHelicopter+'deg)';
        toggleHelicopter = !toggleHelicopter
        option = document.getElementById('optionsHelicopters')
        if(!toggleHelicopter)
            manageMarkers(helicopterMarkers,hospitalMarkers)
        else
            manageMarkers("",helicopterMarkers)
    }
    if(clicado=='gavetaHospital'){
        document.getElementById('arrowHospital').style.transform = 'rotate('+180*toggleHospital+'deg)';
        toggleHospital = !toggleHospital
        option = document.getElementById('optionsHospital')
        if(!toggleHospital)
            manageMarkers(hospitalMarkers,helicopterMarkers)
        else
            manageMarkers("",hospitalMarkers)
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

  function manageMarkers(display=0,hide){
    let typeOfMarkerDisp
    let typeOfMarkerHide

    if(hide == helicopterMarkers){
        typeOfMarkerHide = 'heliSel'
        typeOfMarkerDisp = 'hospSel'
    }
    else{
        typeOfMarkerHide = 'hospSel'
        typeOfMarkerDisp = 'heliSel'  
    }
        
    if(display){
        for(let i = 0;i<display.length;i++){
            map.addLayer(display[i])
    }}
    for(let i = 0;i<hide.length;i++){
        let selector = document.getElementById(typeOfMarkerHide+i)
        if(!selector.classList.contains("selected"))
            map.removeLayer(hide[i])
    }   
  }

  function traceRoute(){
    let routeArray = ['','','']
    let crmpass = ''
    let oacipass = ''
    routeArray[1] = acidente.getLatLng()
    for(let i = 0;i<helicopterMarkers.length;i++){
        let selector = document.getElementById('heliSel'+i)
        if(selector.classList.contains('selected')){
            oacipass = codigo_oaci[i]
            routeArray[0] = helicopterMarkers[i].getLatLng()}
    }
    for(let i = 0;i<hospitalMarkers.length;i++){
        let selector = document.getElementById('hospSel'+i)
        if(selector.classList.contains('selected')){
            crmpass = codigo_crm[i]
            routeArray[2] = hospitalMarkers[i].getLatLng()}
    }
    console.log(routeArray)
    var polyline = L.polyline(routeArray, {color: 'red'})
    polyline.addTo(map)

    var volta = [routeArray[0],routeArray[2]]
    polyline2 = L.polyline(volta, {color: 'blue'})
    polyline2.addTo(map)

    map.fitBounds(polyline.getBounds())
    data = new Date()
    datapass = data.getDate()+'/'+data.getMonth()+'/'+data.getFullYear()+' '+data.getHours()+':'+data.getMinutes()
    postOccurence(1,"72201",1,oacipass,crmpass,datapass,"test","test")
  }