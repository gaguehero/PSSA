function setEventListener(){
    let signupform = document.getElementById("signupform");

    signupform.addEventListener("submit", (e) => {
        e.preventDefault();
        let nome = document.getElementById("nameField");
        let email = document.getElementById("username");
        let pass = document.getElementById("password");
        let userType = document.querySelector('input[name="User Type"]:checked').value;
        let emailEmUso = document.getElementById("alertaEmailUso")
        emailEmUso.innerText = ""
        let url = "http://127.0.0.1:5000/registerUser"
        data = new FormData()
        data.append('nome',nome.value.trim())
        data.append('email',email.value.trim())
        data.append('pass',pass.value.trim())
        data.append('userType',userType)

        fetch(url,{"method":"POST","body":data}).then(r=>r.json()).then(d=>{
            if(d==0){
                //erro de email já cadastrado.
                emailEmUso.innerText = "Este email já foi cadastrado!"

            }
            else if(d==1){
                let form = document.getElementById('caixaDoFormulario')
                form.innerHTML ="<h1>Sign Up</h1>"+"<div>Cadastro Realizado com Sucesso</div>"
            }
            else{
                alert("Ocorreu um Erro Inesperado, tente novamente mais tarde...")
            }
        })
      });
}
