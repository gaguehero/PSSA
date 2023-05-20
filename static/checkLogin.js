let logado = 0
let email = ''
function getLogin(){
    logado = sessionStorage.getItem('logado')
    email = sessionStorage.getItem('email')
    if(logado){
        let registerOcurrence = document.getElementById('userOperationalExclusive')
        registerOcurrence.style.display = "block"
        let loginButton = document.getElementById('login')
        loginButton.innerHTML = "<a onclick='logout()'>Logout</a>"
    }
}

function logout(){
    sessionStorage.clear()
    window.location.reload();
}