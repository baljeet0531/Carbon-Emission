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


