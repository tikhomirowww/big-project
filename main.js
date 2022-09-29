// account logic start
// show modal logic
let registerUserModalBtn = document.querySelector('#registerUser-modal');
let loginUserModalBtn = document.querySelector('#loginUser-modal');
let registerUserModalBlock = document.querySelector('#registerUser-block');
let loginUserModalBlock = document.querySelector('#loginUser-block');
let registerUserBtn = document.querySelector('#registerUser-btn');
let loginUserBtn = document.querySelector('#loginUser-btn');
let logoutUserBtn = document.querySelector('#logoutUser-btn');

registerUserModalBtn.addEventListener('click', () => {
    registerUserModalBlock.setAttribute('style', 'display: block !important;');
    registerUserBtn.setAttribute('style', 'display: block !important;')
    loginUserModalBlock.setAttribute('style', 'display: none !important;')
    loginUserBtn.setAttribute('style', 'display: none !important;')
})

loginUserModalBtn.addEventListener('click', () => {
    registerUserModalBlock.setAttribute('style', 'display: none !important;');
    registerUserBtn.setAttribute('style', 'display: none !important;')
    loginUserModalBlock.setAttribute('style', 'display: block !important;')
    loginUserBtn.setAttribute('style', 'display: block !important;')
})

// register logic
const USERS_API = 'http://localhost:3000/users';

//inputs group

let usernameInp = document.querySelector('#reg-username');
let ageInp = document.querySelector('#reg-age');
let passwordInp = document.querySelector('#reg-password');
let passwordConfirmInp = document.querySelector('#reg-passwordConfirm');
let isAdminInp = document.querySelector('#isAdmin');

async function checkUniqueUserName(userName){
    let res = await fetch(USERS_API);
    let users = await res.json();
    return users.some(item => item.username === userName);
};

async function registerUser(){
    if(
        !usernameInp.value.trim() ||
        !ageInp.value.trim() ||
        !passwordInp.value.trim() ||
        !passwordConfirmInp.value.trim() 
    ){
        alert('Some inputs are empty!');
        return;
    };

    let uniqueUserName = await checkUniqueUserName(usernameInp.value);

    if(uniqueUserName){
        alert('User already exists')
        return;
    };

    if(passwordInp.value !== passwordConfirmInp.value){
        alert('Password do not match');
        return;
    }

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
    passwordConfirmInp.value = '';
    isAdminInp.checked = false;

};

registerUserBtn.addEventListener('click', registerUser);

// login logic 
let showUsername = document.querySelector('#showUsername');

function checkLoginLogoutStatus(){
    let user = localStorage.getItem('user');
    if(!user){
        loginUserModalBtn.parentNode.style.display = 'block';
        logoutUserBtn.parentNode.style.display = 'none';
        showUsername.innerText = 'No user'
    }else{
        loginUserModalBtn.parentNode.style.display = 'none';
        logoutUserBtn.parentNode.style.display = 'block';
        showUsername.innerText = JSON.parse(user).user;
    };
    showAdminPanel();
    showEditUserBtn();
}
checkLoginLogoutStatus()

let loginUsernameInp = document.querySelector('#login-username');
let loginPasswordInp = document.querySelector('#login-password');

function checkUserInUsers(username, users){
    return users.some(item => item.username === username)
};

function checkUserPassword(user, password){
    return user.password === password;
};

function initStorage(){
    if(!localStorage.getItem('user')){
        localStorage.setItem('user', '{}')
    };
};

function setUserToStorage(username, isAdmin){
    localStorage.setItem('user', JSON.stringify({user: username, isAdmin: isAdmin}))
}

async function loginUser(){
    let res = await fetch(USERS_API);
    let users = await res.json();

    // console.log(users);

    if(!loginUsernameInp.value.trim() || !loginPasswordInp.value.trim()){
        alert('Some inputs are empty!');
        return;
    };

    if(!checkUserInUsers(loginUsernameInp.value, users)){
        alert('User is not found!');
        return;
    };

    let userObj = users.find(item => item.username === loginUsernameInp.value);

    if(!checkUserPassword(userObj, loginPasswordInp.value)){
        alert('Wrong password!');
        return;
    };


    initStorage();

    setUserToStorage(userObj.username, userObj.isAdmin);

    loginUsernameInp.value = '';
    loginPasswordInp.value = '';

    checkLoginLogoutStatus();

    let btnCloseModal = document.querySelector('#btn-close-modal');
    btnCloseModal.click()

    render()

};

loginUserBtn.addEventListener('click', loginUser);

// logout logic 
logoutUserBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    checkLoginLogoutStatus();
    render()
})

// create product logic 
function checkUserForProductCreate(){
    let user = JSON.parse(localStorage.getItem('user'));
    if(user) return user.isAdmin;
    return false;
};

function showAdminPanel(){
    let adminPanel = document.querySelector('#admin-panel');
    if(!checkUserForProductCreate()){
        adminPanel.setAttribute('style', 'display: none !important;');
    }else{
        adminPanel.setAttribute('style', 'display: block !important;');
    }
};

// create 
let productTitle = document.querySelector('#product-title');
let productPrice = document.querySelector('#product-price');
let productDesc = document.querySelector('#product-desc');
let productImage = document.querySelector('#product-image');
let productCategory = document.querySelector('#product-category')

const PRODUCTS_API = 'http://localhost:3000/products'

async function createProduct(){
    if(
        !productTitle.value.trim() ||
        !productPrice.value.trim() ||
        !productDesc.value.trim() ||
        !productImage.value.trim() ||
        !productCategory.value.trim()
    ){
        alert('Some inputs are empty!');
        return;
    };

    let productObj = {
        title: productTitle.value,
        price: productPrice.value,
        desc: productDesc.value,
        image: productImage.value,
        category: productCategory.value
    };

    await fetch(PRODUCTS_API, {
        method: 'POST',
        body: JSON.stringify(productObj),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    productTitle.value = '';
    productPrice.value = '';
    productDesc.value = '';
    productImage.value = '';
    productCategory.value = '';
    render();
};

let addProductBtn = document.querySelector('#add-product-btn');
addProductBtn.addEventListener('click', createProduct)

// read
let currentPage = 1;
let search = '';
let category = '';
let limit = 2;



async function render(){
    let productsList = document.querySelector('#products-list');
    productsList.innerHTML = '';
    let requestAPI = `${PRODUCTS_API}?q=${search}&category=${category}&_page=${currentPage}&_limit=${limit}`;
    if(!category){
        requestAPI = `${PRODUCTS_API}?q=${search}&_page=${currentPage}&_limit=${limit}`;
    }
    if(search !== ''){
        requestAPI = `${PRODUCTS_API}?q=${search}`
    }
    let res = await fetch(requestAPI);
    let data = await res.json();
    data.forEach(item => {
    productsList.innerHTML += `
        <div class="card" id="${item.id}" style="width: 18rem;">
        <img src="${item.image}" style="height: 400px;" class="card-img-top" alt="error((((((((">
        <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        <p class="card-text">${item.desc}</p>
        <p class="card-text">${item.category}</p>
        <p class="card-text">${item.price}</p>
        ${checkUserForProductCreate() ? 
        `<a href="#" class="btn btn-danger btn-delete" id="${item.id}">Delete</a>
        <a href="#" class="btn btn-success btn-edit" id="${item.id}">Update</a>`
        : ''}
        </div>
        </div>
        `
    });

    if(data.length === 0) return;
    addEditEvent();
    addDeleteEvent();
};
render();

async function addCategoryToDropdownMenu(){
    let res = await fetch(PRODUCTS_API);
    let data = await res.json();
    let categories = new Set(data.map(item => item.category))
    console.log(categories);
    let categoriesList = document.querySelector('.dropdown-menu');
    categoriesList.innerHTML = '<li><a class="dropdown-item" href="#">All</a></li>'
    categories.forEach(item => {
        categoriesList.innerHTML += `
        <li><a class="dropdown-item" href="#">${item}</a></li>
        `
    })
    addClickEventToDropdownItem();
}
addCategoryToDropdownMenu();

// update 
let saveChangesBtn = document.querySelector('.save-changes-btn');

function checkCreateAndSaveBtn(){
    if(saveChangesBtn.id){
        addProductBtn.setAttribute('style', 'display: none;');
        saveChangesBtn.setAttribute('style', 'display: block;');
    }else{
        addProductBtn.setAttribute('style', 'display: block;');
        saveChangesBtn.setAttribute('style', 'display: none;');
    }
}
checkCreateAndSaveBtn()

async function addProductDataToForm(e){
    let productId = e.target.id;
    let res = await fetch(`${PRODUCTS_API}/${productId}`);
    let productObj = await res.json();

    productTitle.value = productObj.title;
    productPrice.value = productObj.price;
    productDesc.value = productObj.desc;
    productImage.value = productObj.image;
    productCategory.value = productObj.category;

    saveChangesBtn.setAttribute('id', productObj.id);

    checkCreateAndSaveBtn();
}

function addEditEvent(){
    let btnEditProduct = document.querySelectorAll('.btn-edit');
    btnEditProduct.forEach(item => {
        item.addEventListener('click', addProductDataToForm)
    })
};

async function saveChanges(e){
    let updatedProductObj = {
        id: e.target.id,
        title: productTitle.value,
        price: productPrice.value,
        desc: productDesc.value,
        image: productImage.value,
        category: productCategory.value
    };

    await fetch(`${PRODUCTS_API}/${e.target.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProductObj),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    productTitle.value = '';
    productPrice.value = '';
    productDesc.value = '';
    productImage.value = '';
    productCategory.value = ''

    saveChangesBtn.removeAttribute('id');

    checkCreateAndSaveBtn();

    render()
};

saveChangesBtn.addEventListener('click', saveChanges);

// delete 
async function deleteProduct(e){
    let productId = e.target.id;

    await fetch(`${PRODUCTS_API}/${productId}`, {
        method: 'DELETE'
    });

    render();
};

function addDeleteEvent(){
    let deleteProductBtn = document.querySelectorAll('.btn-delete');
    deleteProductBtn.forEach(item => {
        item.addEventListener('click', deleteProduct)
    })
}

// filtering

function filterOnCategory(e){
    let categoryText = e.target.innerText;
    if(categoryText === 'All'){
        category = '';
    }else{
        category = categoryText
    };
    render();
}

function addClickEventToDropdownItem(){
    let categoryItems = document.querySelectorAll('.dropdown-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', filterOnCategory)
    })
}

// search 
let searchInp = document.querySelector('#search-inp');
searchInp.addEventListener('input', () => {
    search = searchInp.value;
    render();
})

// to do: find the bug and fix it 

// pagination 
let prevPageBtn = document.querySelector('#prev-page-btn');
let nextPageBtn = document.querySelector('#next-page-btn');

prevPageBtn.addEventListener('click', () => { 
    currentPage -- ; 
    render(); 
    maxProd(); 
}); 
nextPageBtn.addEventListener('click', () => { 
    currentPage++; 
    render(); 
    maxProd(); 
}); 
 
prevPageBtn.style.display = 'none' 
 
    async function maxProd() { 
        let res = await fetch(PRODUCTS_API); 
        let data = await res.json(); 
        console.log(data); 
        let amount = data.length; 
        let pageNum = Math.ceil(amount / limit); 
 
        if (currentPage == 1) { 
         prevPageBtn.style.display = 'none' 
        } else{ 
         prevPageBtn.style.display = 'block' 
        } 
         
        if(currentPage == pageNum){ 
            nextPageBtn.style.display = 'none' 
        }else{ 
            nextPageBtn.style.display = 'block' 
        } 
    } 
 
    maxProd()
 
 
// console.log(maxProd())

// todo: pagination upgrade

// users edit 


function showEditUserBtn(){
    let editUsersBtn = document.querySelector('#editUsers-btn');
    if(!checkUserForProductCreate()){
        editUsersBtn.setAttribute('style', 'display: none !important;');
    }else{
        editUsersBtn.setAttribute('style', 'display: block !important;');
    }
};