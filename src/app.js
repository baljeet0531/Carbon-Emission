function listenForWaitingServiceWorker(reg, callback) {
    function awaitStateChange() {
        reg.installing.addEventListener('statechange', function () {
            if (this.state === 'installed') callback(reg);
        });
    }
    if (!reg) return;
    if (reg.waiting) return callback(reg);
    if (reg.installing) awaitStateChange();
    reg.addEventListener('updatefound', awaitStateChange);
}

// reload once when the new Service Worker starts activating
var refreshing;
navigator.serviceWorker.addEventListener('controllerchange',
    function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    }
);
function promptUserToRefresh(reg) {
    // this is just an example
    // don't use window.confirm in real life; it's terrible
    if (window.confirm("app更新已下載，按下OK載入新版本?")) {
        reg.waiting.postMessage('skipWaiting');
    }
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js')
        .then(reg => {
            console.log(`SW is registered with scope: ${reg.scope}`)
            listenForWaitingServiceWorker(reg, promptUserToRefresh);
        })
        .catch(err => {
            console.log('SW Error ', err)
        })
}


const menuIcon = document.getElementById("menu_icon")
const menuList = document.getElementById("menu_list")
var showList = false;
var listInterval;
var menuListLeft;

menuIcon.addEventListener("click", function () {

    if (showList) {
        closeMenu();
    }
    else {
        openMenu();
    }
})

function closeMenu() {
    showList = false;
    clearInterval(listInterval);
    menuListLeft = parseInt(getComputedStyle(menuList).getPropertyValue("left"));
    listInterval = setInterval(function () {
        if (menuListLeft == -150) {
            clearInterval(listInterval);
        }
        else {
            menuListLeft -= 10;
            menuList.style.left = menuListLeft + 'px';
        }
    }, 15);
}

function openMenu() {
    showList = true;
    clearInterval(listInterval);
    menuListLeft = parseInt(getComputedStyle(menuList).getPropertyValue("left"));
    listInterval = setInterval(function () {
        if (menuListLeft == 0) {
            clearInterval(listInterval);
        }
        else {
            menuListLeft += 10;
            menuList.style.left = menuListLeft + 'px';
        }
    }, 15);
}

const mainFrame = document.getElementsByClassName("main_frame");
// //length - 1 for not adding event to logout page
for (i = 0; i < mainFrame.length - 1; i++) {
    mainFrame[i].addEventListener("click", closeMenu);
}


const menuClass = document.getElementsByClassName("menu");
// //length - 1 for not adding event to logout page
for (i = 0; i < menuClass.length - 1; i++) {
    menuClass[i].addEventListener("click", closeMenu);
}

const frameClass = document.getElementsByClassName("main_frame")
window.onhashchange = hashChange

function hashChange() {

    for (i = 0; i < frameClass.length; i++) {
        frameClass[i].style.display = "none";
    }
    hashTag = window.location.hash;
    hashTag = hashTag.slice(1) + "_div";
    try {
        document.getElementById(hashTag).style.display = "block";
    }
    catch {
        document.getElementById("home_div").style.display = "block";
    }
    closeMenu();
}

function logOut() {
    localStorage.removeItem("studentID");
    localStorage.removeItem("studentName");
    location.reload();
}