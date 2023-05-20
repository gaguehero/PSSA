function setEventListener(){
    let loginform = document.getElementById("loginform");

    loginform.addEventListener("submit", (e) => {
        e.preventDefault();
        let email = document.getElementById("username");
        let pass = document.getElementById("password");
        let url = "http://127.0.0.1:5000/login"
        data = new FormData()
        data.append('email',email.value.trim())
        data.append('pass',pass.value.trim())

        fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
            if(d==true){
                sessionStorage.setItem("logado", 1);
                sessionStorage.setItem("email",email.value.trim())
                window.location.href='/index'
            }
            else{
                //alert("Email ou Senha inválidos")
                let loginInvalido = document.getElementById("alertaLoginInvalido")
                loginInvalido.innerText = "Usuário ou Senha Inválidos"
            }

        })

    })
}