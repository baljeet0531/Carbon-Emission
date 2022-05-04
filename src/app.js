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
    if (window.confirm("New version available! OK to refresh?")) {
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

menuIcon.addEventListener("click", function () {
    clearInterval(listInterval)
    menuListLeft = parseInt(getComputedStyle(menuList).getPropertyValue("left"));
    if (showList) {
        showList = !showList
        listInterval = setInterval(function () {
            menuListLeft -= 10;
            menuList.style.left = menuListLeft + 'px';
            if (getComputedStyle(menuList).getPropertyValue("left") == "-150px") {
                clearInterval(listInterval);
            }
        }, 15)
    }
    else {
        showList = !showList
        listInterval = setInterval(function () {
            menuListLeft += 10;
            menuList.style.left = menuListLeft + 'px';
            if (getComputedStyle(menuList).getPropertyValue("left") == "0px") {
                clearInterval(listInterval);
            }
        }, 15)
    }
})
