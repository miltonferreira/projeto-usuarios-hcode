class UserController {
    //recebe as infos do formulario e retorna com o metodo getValues() os valores do formulario

    constructor(formId, tableId){
        this.formEl = document.getElementById(formId);  //pega ID do formulario
        this.tableEl = document.getElementById(tableId); //pega o ID da tabela que mostra os users

        this.onSubmit();    //usado quando o usuario clicar para enviar formulario
    }

    // metodo para enviar infos do formulario quando for clicado botão de envio
    onSubmit(){

        this.formEl.addEventListener("submit", event => {
    
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");   //pega o botao de envio de infos

            btn.disabled = true;    //desativa o botão quando enviar infos

            let values = this.getValues();  //recebe as infos do formulario

            // promise para carrega imagem e depois a lista do usuarios
            this.getPhoto().then(
                (content) => {
                    values.photo = content;
                    this.addLine(values);       //adiciona na lista o novo usuario e infos

                    this.formEl.reset();        // limpa o formulario

                    btn.disabled = false;       //ativa o botão quando enviar infos
                }, 
                (e) => {
                    console.error(e);
                }
            );
            
        });

    }

    // metodo para pegar foto e seu path/url
    getPhoto(){

        // cria uma nova classe Promise
        return new Promise((resolve, reject) =>{

            let fileReader = new FileReader();

            // array das fotos
            let elements = [...this.formEl.elements].filter(item => {

                if (item.name === 'photo'){
                    return item;
                }

            });

            let file = elements[0].files[0]; // infos da foto

            // esse é o callback que carrega foto <<<<<<<<<<<<<<<<<<<<<<<<
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = () => {
                reject(e);   // caso aconteça um erro e retorna o erro
            };

            // checa se foi enviado algum arquivo de foto
            if(file){
                fileReader.readAsDataURL(file); //carrega a foto
            } else {
                resolve('dist/img/boxed-bg.jpg');   //caso não tenha enviado foto, retorna com imagem padrão
            }
            

        });

        

    }

    // metodo que recebe os valores do formulario
    getValues(){

        let user = {};
        
        //forEach recebe um array e this.formEl.elements é uma coleção
        //[... ] é um operador Spread
        [...this.formEl.elements].forEach(function(field, index){

            if(field.name == "gender"){
                if(field.checked)
                user[field.name] = field.value;
            } else if(field.name == "admin"){
                
                //se marcar no formulario como admin fica true, se não false
                user[field.name] = field.checked;

            } else {
                user[field.name] = field.value;
            }
        
        });
        
        //retorna um obj do formulario
        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );
        
    }

    // metodo para adiciona as infos do formulario na tela
    addLine(dataUser){

        let tr = document.createElement('tr');
    
        tr.innerHTML = `
            
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                <td>${Utils.dateFormat(dataUser.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                     <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
                </td>
            
            `;

        this.tableEl.appendChild(tr);
    
    }

}