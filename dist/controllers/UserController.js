class UserController {
    //recebe as infos do formulario e retorna com o metodo getValues() os valores do formulario

    constructor(formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);  //pega ID do formulario que cria novo user
        this.formUpdateEl = document.getElementById(formIdUpdate);  //pega ID do formulario que edita um user
        this.tableEl = document.getElementById(tableId); //pega o ID da tabela que mostra os users

        this.onSubmit();        // usado quando o usuario clicar para enviar formulario
        this.onEdit();          // botao para cancelar edição do user
        this.selectAll();       // mostra na sessão a página com lista de users

    }

    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e =>{
            this.showPanelCreate(); //mostra form de novo user e oculta de editar user
        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault(); //cancela o comportamento padrao. EX: Atualizar a página

            let btn = this.formUpdateEl.querySelector("[type=submit]");     //pega o botao de envio de infos

            btn.disabled = true;                                            //desativa o botão quando enviar infos

            let values = this.getValues(this.formUpdateEl);                 //recebe as infos do formulario

            let index =  this.formUpdateEl.dataset.trIndex;                 //pega posição do user no index

            let tr = this.tableEl.rows[index];                              //indica onde vai ser alterado as info do user

            let userOld = JSON.parse(tr.dataset.user);                      //pega o valores antigos do user

            let result = Object.assign({}, userOld, values);                 //mescla os valores
                   
                      
            // promise para carrega imagem e depois a lista do usuarios
            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values.photo){
                        result._photo = userOld._photo;     // usa a foto antiga, caso nao tenha escolhido outra
                    } else {
                        result._photo = content;            // usa a foto nova, caso o user tenha escolhido outra
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();                            // insere o user no sessionStorage

                    this.getTr(user, tr);
                    
                    this.updateCount();                     // Atualiza numeros de users e admins

                    this.formUpdateEl.reset();              // limpa os campos do formulario

                    btn.disabled = false;                   //ativa o botão quando enviar infos

                    this.showPanelCreate();                 // mostra o formulario para criar novo user
                }, 
                (e) => {
                    console.error(e);
                }
            );

        });

    }

    // metodo para enviar infos do formulario quando for clicado botão de envio
    onSubmit(){

        this.formEl.addEventListener("submit", event => {
    
            event.preventDefault(); //cancela o comportamento padrao. EX: Atualizar a página

            let btn = this.formEl.querySelector("[type=submit]");   //pega o botao de envio de infos

            btn.disabled = true;    //desativa o botão quando enviar infos

            let values = this.getValues(this.formEl);  //recebe as infos do formulario

            // evita que dê erro ao tenta add foto ao obj values que nesse caso é um boolean
            if(!values) return false;

            // promise para carrega imagem e depois a lista do usuarios
            this.getPhoto(this.formEl).then(
                (content) => {
                    values.photo = content;
                    this.addLine(values);       // adiciona na lista o novo usuario e infos

                    values.save();              // insere o user no sessionStorage

                    this.formEl.reset();        // limpa o formulario

                    btn.disabled = false;       // ativa o botão quando enviar infos
                }, 
                (e) => {
                    console.error(e);
                }
            );
            
        });

    }

    // metodo para pegar foto e seu path/url
    getPhoto(formEl){

        // cria uma nova classe Promise
        return new Promise((resolve, reject) =>{

            let fileReader = new FileReader();

            // array das fotos
            let elements = [...formEl.elements].filter(item => {

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
    getValues(formEl){

        let user = {};
        let isValid = true;
        
        //forEach recebe um array e this.formEl.elements é uma coleção
        //[... ] é um operador Spread
        [...formEl.elements].forEach(function(field, index){

            // verifica se campos obrigatorios nao foram preenchidos
            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
                field.parentElement.classList.add('has-error');     //indica qual campo obrigatorio deve ser preenchido
                isValid = false;                                    // indica que a validação é falsa
            }

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

        if(!isValid){
            return false;   // retorna para não criar o obj do user
        }
        
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

    // mostra na sessão a página com lista de users
    selectAll(){

        let users = User.getUsersStorage();  //pega os users salvos na sessão da pagina

        users.forEach(dataUser =>{

            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);
        });

    }

    // metodo para adiciona as infos do formulario na tela
    addLine(dataUser){

        let tr = this.getTr(dataUser);
        
        this.tableEl.appendChild(tr);       //cria uma nova tr dentro da tabela

        this.updateCount();                 //Atualiza numeros de users e admins
    
    }

    getTr(dataUser, tr = null){

        if(tr === null) tr = document.createElement('tr');  // se tr for nulo, cria um novo tr

        tr.dataset.user = JSON.stringify(dataUser);         // converte para JSON as infos para jogar no HTML

        tr.innerHTML = `
            
                <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
                <td>${Utils.dateFormat(dataUser.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                     <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                </td>
            
            `;

        this.addEventsTr(tr);

        return tr;

    }

    // Evento para incluir infos do user na lista de users
    addEventsTr(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e => {
            
            if(confirm("Deseja realmente excluir?")){

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();          // remove o user do localStorage

                tr.remove();            // deleta o user
                this.updateCount();     // atualiza a quantidade de user na lista

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user);
            
            // let form = document.querySelector("#form-user-update");

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;  // pega a posição do user no tr, util quando atualizar o user

            for(let name in json){

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");  // tira o _ do campo

                // console.log(name, field);
                
                if(field){

                    switch(field.type){
                        case 'file':
                            continue;       //ignora o resto do código e vai para o proximo valor do array
                        break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] +"]");  // tira o _ do campo
                            field.checked = true;
                        break;

                        case 'checkbox':
                            field.checked = json[name]; //field do admin
                        break;

                        default:
                            field.value = json[name];   // retorna o conteudo para o campo do formulario      
                    }

                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;    //pega a foto salva pelo user

            this.showPanelUpdate();
        });
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";  //oculta form de add novo user
        document.querySelector("#box-user-update").style.display = "none"; //mostra form para editar user
    }

    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";  //oculta form de add novo user
        document.querySelector("#box-user-update").style.display = "block"; //mostra form para editar user
    }

    //Atualiza numeros de users e admins
    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        // atraves do console.dir(this.tableEl); encontramos o children que é uma coleção
        // convertemos children em um array
        [...this.tableEl.children].forEach(tr =>{
            numberUsers++;
            
            let user = JSON.parse(tr.dataset.user);

            // _admin pega o get da classe User
            if(user._admin) numberAdmin++;

            // console.log(tr.dataset.user);
        });

        document.querySelector("#number-users").innerHTML = numberUsers;         //atualiza o contador
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;   //atualiza o contador

    }

}