function buscaSemID(){
    let rodovia = document.getElementById('rodovia').value
    //valor = rodovia.options[rodovia.selectedIndex]
    //console.log(rodovia)
    let imagem = document.getElementById('mapa')
    if(rodovia){
        if(rodovia == 'br101')
            imagem.src = "imgs/br101.png"
        if(rodovia == 'br116')
            imagem.src = "imgs/br116.jpg"
        if(rodovia == 'br153')
            imagem.src = "imgs/br153.png"
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

    var chart = new google.visualization.BarChart(document.getElementById('estatisticas'));
    chart.draw(data, options);
}
vector = [
    ['2015', 3],
    ['2016', 1],
    ['2017', 1],
    ['2018', 1],
    ['2019', 2],
    ['2020', 4],
    ['2021', 5]
]
function carregaChart(){
    
    google.charts.load('current', {'packages':['corechart']})
    google.charts.setOnLoadCallback(drawChart)
}
