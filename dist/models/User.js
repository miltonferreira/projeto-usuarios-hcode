class User {

    constructor(name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();

    }

    get id(){
        return this._id;
    }

    get name(){
        return this._name;
    }

    get gender(){
        return this._gender;
    }

    get birth(){
        return this._birth;
    }

    get country(){
        return this._country;
    }

    get email(){
        return this._email;
    }

    get password(){
        return this._password;
    }

    get photo(){
        return this._photo;
    }

    get admin(){
        return this._admin;
    }

    get register(){
        return this._register;
    }

    // set ------------------------------------

    set name(value){
        this._name = value;
    }

    set gender(value){
        this._gender = value;
    }

    set birth(value){
        this._birth = value;
    }

    set country(value){
        this._country = value;
    }

    set email(value){
        this._email = value;
    }

    set password(value){
        this._password = value;
    }

    set photo(value){
        this._photo = value;
    }

    set admin(value){
        this._admin = value;
    }

    set register(value){
        this._register = value;
    }

    loadFromJSON(json){

        for(let name in json){

            switch(name){
                case '_register':
                    this[name] = new Date(json[name]);  // converte o register para um obj do tipo Date
                break;
            default:
            this[name] = json[name];    // cada atributo recebe seu valor correspondente
            }
        }

    }

    // Pega os users e retorna em JSON
    static getUsersStorage(){

        let users = [];

        //if(sessionStorage.getItem("users")){
        if(localStorage.getItem("users")){
            // users = JSON.parse(sessionStorage.getItem("users"));    //converte para JSON
            users = JSON.parse(localStorage.getItem("users"));    //converte para JSON
        }

        return users;

    }

    // gera novo ID para o user
    getNewID(){

        let usersID = parseInt(localStorage.getItem("usersID"));

        //indica que nao existe o valor
        if(!usersID > 0){

            usersID = 0;
            
        }

        usersID++;
        localStorage.setItem("usersID", usersID);

        return usersID;        

    }

    // salva infos do user
    save(){

        let users = User.getUsersStorage();  //pega os users salvos na sessão da pagina

        //verifica se existe um ID
        if(this.id > 0){


            users.map(u => {

                if(u._id == this.id){
                    Object.assign(u, this); // esquerda infos antigas, direita infos novas
                }

                return u;

            });

            // let user = users.filter(u =>{
            //     return u._id === this.id;   //retorna as infos do user se tiver o id
            // });

            // let newUser = Object.assign({}, user, this);  // mescla user con infos antigas, com infos novas



        } else {

            this._id = this.getNewID(); // recebe um novo ID

            users.push(this);

        // sessionStorage.setItem("users", JSON.stringify(users));     //converte para string chave:valor
                        
        }

        localStorage.setItem("users", JSON.stringify(users));           // salva os users no localStorage

    }

    remove(){

        let users = User.getUsersStorage();  //pega a lista de users salvos na sessão da pagina

        users.forEach((userData, index) => {
            
            // compara os ID's
            if(this._id == userData._id){
                users.splice(index, 1);     //remove o user com o 1, indicando que é somente ele
                // removeItem para a lista users por completo
            }

        });

        localStorage.setItem("users", JSON.stringify(users));           // salva os users no localStorage

    }

}