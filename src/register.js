var studentID, studentName;

function loginConfirm() {

    if (studentID && studentName) {
        // Check if ID in DB
        cameraStop()
        //if no
        //showRegisterPage()
        document.getElementById("login_page").style.display = "none"
        document.getElementById("register_page").style.display = "block"
        document.getElementById("IDandName").innerHTML = "歡迎 " + studentID + studentName + " 的加入！"
    }
}
var registerPage;
function showPrev() {

    registerPage = document.getElementsByClassName("regPage");
    for (i = 0; i < registerPage.length; i++) {
        if (getComputedStyle(registerPage[i]).getPropertyValue("display") == "block") {
            registerPage[i - 1].style.display = "block"
            registerPage[i].style.display = "none"
            break
        }
    }
}
function showNext(step) {
    if ((step == "") || (step == "SchoolVehicle" && schoolVehicle) || (step == "longDistanceVehicle" && longDistanceVehicle) || (step == "frequency" && document.querySelector('#freq_input_div input').value)) {
        registerPage = document.getElementsByClassName("regPage");
        for (i = 0; i < registerPage.length; i++) {
            if (getComputedStyle(registerPage[i]).getPropertyValue("display") == "block") {
                registerPage[i + 1].style.display = "block"
                registerPage[i].style.display = "none"
                break
            }
        }
    }
}

var schoolVehicle, longDistanceVehicle;
function select(obj) {

    clsName = obj.className
    optionSelect = clsName.split(" ")[1]
    if (optionSelect == "schoolVehicle") {
        options = document.querySelectorAll("#questionnaireSchoolVehicle .option")
        for (i = 0; i < options.length; i++) {
            options[i].style.borderColor = "white"
        }
        schoolVehicle = true;
    }
    else if (optionSelect == "longDistanceVehicle") {
        options = document.querySelectorAll("#questionnaireLongDistanceVehicle .option")
        for (i = 0; i < options.length; i++) {
            options[i].style.borderColor = "white"
        }
        longDistanceVehicle = true;
    }
    obj.style.borderColor = "#a6a6a6";
}

// var width = 320;
// var height = 0;
// var streaming = false;

var video = document.getElementById('scanner');
function getCamera() {
    navigator.mediaDevices.getUserMedia({
        video: {
            width: 4000,
            height: 3000,
            facingMode: { exact: "environment" },
            zoom: 2,
        },
        audio: false
    })
        // on success, stream it in video tag
        .then(function (stream) {
            window.stream = stream
            video.srcObject = stream;
            video.play();

            const [track] = stream.getVideoTracks();
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            console.log(capabilities)
            console.log(settings)

            const input = document.querySelector('input[type="range"]');

            // Check whether zoom is supported or not.
            if (!('zoom' in settings)) {
                return Promise.reject('Zoom is not supported by ' + track.label);
            }

            // Map zoom to a slider element.
            input.min = capabilities.zoom.min;
            input.max = capabilities.zoom.max;
            input.step = capabilities.zoom.step;
            input.value = settings.zoom;
            input.oninput = function (event) {
                track.applyConstraints({
                    advanced: [{
                        zoom: event.target.value,
                    }]
                });
                // console.log(track.getSettings().zoom)
            }
            input.hidden = false;
        })
        .catch(function (err) {
            console.log("An error occurred: " + err);
        });
}

window.onload = function () {
    if (localStorage.getItem("studentID") && localStorage.getItem("studentName")) {
        studentID = localStorage.getItem("studentID");
        studentName = localStorage.getItem("studentName");
        showHomepage()
    }
    else {
        document.getElementById("login_page").style.display = "block"
        getCamera()
    }
}


function cameraStop() {
    if (window.stream) {
        const videoStreams = window.stream.getVideoTracks()

        videoStreams.forEach(stream => {
            stream.stop()
        });

        video.src = video.srcObject = null;
    }
}
// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext('2d');
// function paintToCanvas() {
//     const width = video.videoWidth;
//     const height = video.videoHeight;
//     //使canvas的像素等同於video的像素
//     canvas.width = width;
//     canvas.height = height;
//     //每16ms更新一次canvas
//     return setInterval(() => {
//         ctx.drawImage(video, 0, 0, width, height);
//     }, 10);
// }


// video.addEventListener('canplay', function (ev) {
//     if (!streaming) {
//         // height = video.videoHeight / (video.videoWidth / width);

//         // if (isNaN(height)) {
//         //     height = width / (4 / 3);
//         // }

//         // video.setAttribute('width', width);
//         // video.setAttribute('height', height);
//         streaming = true;
//     }
// }, false);

// function scan() {
//     if (!('BarcodeDetector' in window)) {
//         console.log('Barcode Detector is not supported by this browser.');
//     } else {
//         console.log('Barcode Detector supported!');

//         // create new detector
//         var barcodeDetector = new BarcodeDetector({
//             formats: [
//                 'aztec',
//                 'code_128',
//                 'code_39',
//                 'code_93',
//                 'codabar',
//                 'data_matrix',
//                 'ean_13',
//                 'ean_8',
//                 'itf',
//                 'pdf417',
//                 'qr_code',
//                 'upc_a',
//                 'upc_e'
//             ]
//         });


//         // BarcodeDetector.getSupportedFormats()
//         //     .then(supportedFormats => {
//         //         supportedFormats.forEach(format => console.log(format));
//         //     });

//         var scanInterval

//         scanInterval = setInterval(
//             function () {
//                 barcodeDetector.detect(video)
//                     .then(barcodes => {
//                         barcodes.forEach(barcode => {
//                             console.log(barcode.format)
//                             console.log(barcode.rawValue);
//                             // clearInterval(scanInterval);
//                         });
//                     })
//                     .catch(err => {
//                         console.log(err);
//                     })
//             }, 1000)
//     }
// }

const canvas = document.getElementById("snap");

function takePhoto() {
    document.getElementById("to_canvas_btn").innerHTML = "重新拍照"
    const ctx = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = 280;
    canvas.height = 175;
    ctx.drawImage(video, 0, 0, width, width / 280 * 175, 0, 0, 280, 175);
}

// function scan2() {
//     var barcodeDetector2 = new BarcodeDetector({
//         formats: [
//             'aztec',
//             'code_128',
//             'code_39',
//             'code_93',
//             'codabar',
//             'data_matrix',
//             'ean_13',
//             'ean_8',
//             'itf',
//             'pdf417',
//             'qr_code',
//             'upc_a',
//             'upc_e'
//         ]
//     });

//     var image = document.querySelector("img")

//     console.log(image)

//     barcodeDetector2.detect(image)
//         .then(barcodes => {
//             console.log(barcodes)
//             barcodes.forEach(barcode => {
//                 console.log(barcode.format)
//                 console.log(barcode.rawValue);
//             });
//         })
//         .catch(err => {
//             console.log(err);
//         })
// }


var result = document.getElementById("result");

function scanImage() {
    result.innerHTML = "偵測中"
    console.time()
    base64 = canvas.toDataURL().split(",")[1]

    fetch('./scan', {
        method: 'POST',
        body: base64
    }).then((response) => {
        console.log(response)
        return response.json()
    }).then(function (data) {
        console.log(data);
        if (data["ID"]) {
            result.innerHTML = "ID：" + data["ID"] + "<br><br>姓名：" + data["Name"];
            studentID = data["ID"];
            studentName = data["Name"];
        }
        else {
            result.innerHTML = "Error: " + data["message"];
        }
    }).catch(function (err) {
        console.log(err);
    });
    console.timeEnd()
};

function showHomepage(state) {
    if (!localStorage.getItem("UpdateDate")) {
        localStorage.setItem("UpdateDate", "-")
        localStorage.setItem("WeekCO2E", "-")
        localStorage.setItem("WeekDist", "-")
        localStorage.setItem("WeekRecord", "-")
    }
    if (state == "register") {
        localStorage.setItem("studentID", studentID);
        localStorage.setItem("studentName", studentName);
    }
    if (localStorage.getItem("UpdateDate") != (new Date().toISOString().split("T")[0])) {
        localStorage.setItem("TodayCO2E", "-")
        localStorage.setItem("TodayDist", "-")
        localStorage.setItem("TodayRecord", "-")
    }
    showInfo()
    document.getElementById("user_info").innerHTML = "ID：" + studentID + "<br>姓名：" + studentName
    document.querySelector("#rank_1st td:nth-child(2)").innerHTML = "<p>" + studentName + "</p>";
    document.getElementById("navigation_bar").style.display = "block";
    document.getElementById("home_div").style.display = "block";
    document.getElementById("register_page").style.display = "none";
    document.getElementById("login_page").style.display = "none";
}

function showInfo() {
    document.getElementById("daily_distance_value").innerHTML = localStorage.getItem("TodayDist") + " km";
    document.getElementById("daily_co2e_value").innerHTML = localStorage.getItem("TodayCO2E");
    document.getElementById("weekly_co2e_value").innerHTML = localStorage.getItem("WeekCO2E") + " kg CO<sub>2</sub>e";
    document.querySelector("#rank_1st td:nth-child(3)").innerHTML = "<p>" + localStorage.getItem("WeekCO2E") + " kg/CO<sub>2</sub>e</p>";
}
