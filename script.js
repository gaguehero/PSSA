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
}
function logado(){
    //cria botão de cadastrar
    let td = document.getElementById('registarOcorrencia')
    let cadastrarAcidente = document.createElement('button')
    cadastrarAcidente.innerHTML = '<a href="register.html">Cadastrar</a>'
    td.appendChild(cadastrarAcidente)
    
}