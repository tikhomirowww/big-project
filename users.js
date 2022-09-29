// show users 
const USERS_API = 'http://localhost:3000/users';

    let usernameInp = document.querySelector('#reg-username');
    let ageInp = document.querySelector('#reg-age');
    let passwordInp = document.querySelector('#reg-password');
    let isAdminInp = document.querySelector('#isAdmin');

async function renderUsers(){
let container = document.querySelector('.container');
container.innerHTML = '';
let res = await fetch(USERS_API);
let data = await res.json();
data.forEach(element => {
    container.innerHTML += `
    <div class="card" style="width: 18rem;">
    <img src="https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png" class="card-img-top" alt="Error(((((((((">
    <div class="card-body">
    <h5 class="card-title">Username: ${element.username}</h5>
    <p class="card-text">Age: ${element.age}</p>
    <p class="card-text">Password: ${element.password}</p>
    <p class="card-text">Admin: ${element.isAdmin}</p>
    <a href="#" class="btn btn-danger btn-delete" id="${element.id}">Delete</a>
    </div>
    </div>
    `
});

if(data.length === 0) return;
addDeleteEvent()

}


renderUsers()

// add user 

    


async function checkUniqueUserName(userName){
    let res = await fetch(USERS_API);
    let users = await res.json();
    return users.some(item => item.username === userName);
};

async function registerUser(){
    if(
        !usernameInp.value.trim() ||
        !ageInp.value.trim() ||
        !passwordInp.value.trim()
    ){
        alert('Some inputs are empty!');
        return;
    };

    let uniqueUserName = await checkUniqueUserName(usernameInp.value);

    if(uniqueUserName){
        alert('User already exists')
        return;
    };


    let userObj = {
        username: usernameInp.value,
        age: ageInp.value,
        password: passwordInp.value,
        isAdmin: isAdminInp.checked
    };

    fetch(USERS_API, {
        method: 'POST',
        body: JSON.stringify(userObj),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    alert('Registered successfully!');

    usernameInp.value = '';
    ageInp.value = '';
    passwordInp.value = '';
    isAdminInp.checked = false;

    renderUsers()

};

let addUser = document.querySelector('#commit')
addUser.addEventListener('click', registerUser);

// delete user 

async function deleteUser(e){
    let userId = e.target.id;

    await fetch(`${USERS_API}/${userId}`, {
        method: 'DELETE'
    });

    renderUsers();
};

function addDeleteEvent(){
    let deleteUserBtn = document.querySelectorAll('.btn-delete');
    deleteUserBtn.forEach(item => {
        item.addEventListener('click', deleteUser)
    })
}