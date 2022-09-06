let mapOptions = {
    center:[52.5002237, -2.94],
    zoom:10
}
let map = new L.map('map' , mapOptions);
let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
map.addLayer(layer);

function buscaSemID(){
    let rodovia = document.getElementById('rodovia').value
    //valor = rodovia.options[rodovia.selectedIndex]
    //console.log(rodovia)
    let imagem = document.getElementById('mapa')
    if(rodovia){
        if(rodovia == 'br158')
            imagem.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3714742.727981074!2d-54.50144814032726!3d-24.600291157710757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94fdaeef899971d7%3A0x10c741f202b617bf!2zQlItMTU4LCBQYXJhbsOh!5e0!3m2!1spt-BR!2sbr!4v1656437063502!5m2!1spt-BR!2sbr"
        if(rodovia == 'br116')
            imagem.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2008816.5414095721!2d-50.33414615037927!3d-25.61030714236869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ddb02982ef5bad%3A0x2f4494a13b9871a1!2sRodovia%20Br%2C%20116%20-%20Centro%2C%20Quitandinha%20-%20PR%2C%2083840-000!5e0!3m2!1spt-BR!2sbr!4v1656436938596!5m2!1spt-BR!2sbr" 
        if(rodovia == 'br153')
            imagem.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3814124.5989618367!2d-52.06306939109465!3d-24.9083758290027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x933c7eda035bcd43%3A0x4ddf53ff0ddb5a49!2sBR-153%2C%20Ipiranga%20-%20PR!5e0!3m2!1spt-BR!2sbr!4v1656436502099!5m2!1spt-BR!2sbr" 
    }
    let busca = document.getElementById('busca')
    let dIni = document.getElementById('dIni').value
    let dFin = document.getElementById('dFin').value 
    let p
    if(dIni){
        try{
            p = document.getElementById('dIniText')
            p.innerHTML = 'Data de inicio: ' + dIni
        }
        catch{
            p = document.createElement('h3')
            p.setAttribute('id','dIniText')
            p.innerHTML = 'Data de inicio: ' + dIni
            busca.appendChild(p)
            console.log('catch')
        }
    }
    if(dFin){
        try{
            p = document.getElementById('dFinText')
            p.innerHTML = 'Data de Final: ' + dFin
        }
        catch{
            p = document.createElement('h3')
            p.setAttribute('id','dFinText')
            p.innerHTML = 'Data de Final: ' + dFin
            busca.appendChild(p)
            console.log('catch')
        }
    }
}
function limpar(){
    let imagem = document.getElementById('mapa')
    imagem.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7432471.978817971!2d-55.816375603025236!3d-24.549937469674937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94db0b9430b8629d%3A0xe893fd5063cef061!2zUGFyYW7DoQ!5e0!3m2!1spt-BR!2sbr!4v1656436044618!5m2!1spt-BR!2sbr" 
}

function logado(flag){
    if(flag){
        let li = document.getElementById('cadastrarOcorrencia')
        //console.log(li)
        li.style.visibility='visible'
        li = document.getElementById('login')
        li.innerHTML = "<a href='#' onclick='return logado(0)'>Logout</a>"
        li = document.getElementById('registrar')
        li.style.visibility='hidden'
    }
    else{
        let li = document.getElementById('cadastrarOcorrencia')
        console.log(li)
        li.style.visibility='hidden'
        li = document.getElementById('login')
        li.innerHTML = "<a href='#' onclick='return logado(1)'>Login</a>"
        li = document.getElementById('registrar')
        li.style.visibility='visible'
    }

}

function addData(){
    let ano = document.getElementById('getAno').value
    let flag = 0
    for(let i=0;i<vector.length;i++){
        if(vector[i][0]==ano.toString()){
            flag = 1
            vector[i][1]++
        }
    }
    if(!flag){
        let dado = [ano.toString(),1]
        vector.push(dado)
    }
    console.log(vector)
    carregaChart()
}

function drawChart() {

    // Create the data table.
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Ano');
    data.addColumn('number', 'Acidentes');
    data.addRows(vector)

    var options = {
        title:'Acidentes por ano',
        legend: {position:'bottom'},
        backgroundColor: '#c7c0f1'};

    var chart = new google.visualization.LineChart(document.getElementById('estatisticas'));
    chart.draw(data, options);
}
vector = [
    ['2015', 300],
    ['2016', 100],
    ['2017', 100],
    ['2018', 100],
    ['2019', 200],
    ['2020', 400],
    ['2021', 500]
]
function carregaChart(){
    
    google.charts.load('current', {'packages':['corechart']})
    google.charts.setOnLoadCallback(drawChart)
}

function povoarEstatisticas(){
    dados =[
        ['BR-116',50],
        ['BR-153',80],
        ['BR-158',45]
    ]
    google.charts.load('current', {'packages':['corechart']})
    google.charts.setOnLoadCallback(drawChart2)
}

function drawChart2(){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Ano');
    data.addColumn('number', 'Acidentes');
    data.addRows(vector)

    var options = {
        title:'Acidentes por ano',
        legend: {position:'bottom'},
        backgroundColor: '#c7c0f1'};

    var chart = new google.visualization.LineChart(document.getElementById('graph1'));
    chart.draw(data, options);
    
    data = new google.visualization.DataTable()
    data.addColumn('string', 'Rodovia')
    data.addColumn('number', 'Acidentes')
    data.addRows(dados)
    options.title = 'Acidentes por Rodovia'
    chart = new google.visualization.BarChart(document.getElementById('graph2'))
    chart.draw(data, options);

    options.title = 'Percentual de Acidentes por Rodovia'
    chart = new google.visualization.PieChart(document.getElementById('graph3'))
    chart.draw(data, options);


    let estatisticas = [
        ['Com Vítima', 30],
        ['Sem Vítima', 70]
    ]
    data = new google.visualization.DataTable()
    data.addColumn('string', 'Status')
    data.addColumn('number', 'Porcentagem')
    data.addRows(estatisticas)
    options.title = 'Percentual de Acidentes Com Vítimas BR-158'
    chart = new google.visualization.PieChart(document.getElementById('graph4'))
    chart.draw(data, options);
}

function registrado(){
    alert('REGISTRADO')
}