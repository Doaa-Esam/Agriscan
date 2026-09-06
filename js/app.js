
// LOGIN PAGE

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        window.location.href = "dashboard.html";

    });

}

// REGISTER PAGE

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;

        }


        window.location.href = "dashboard.html";

    });

}


// GO TO REGISTER

const showRegister =
    document.getElementById("showRegister");

if (showRegister) {

    showRegister.addEventListener("click", function() {

        window.location.href = "Register.html";

    });

}


// GO TO LOGIN

const showLogin =
    document.getElementById("showLogin");

if (showLogin) {

    showLogin.addEventListener("click", function() {

        window.location.href = "login.html";

    });

}

// START NEW SOIL SCAN

const startScanBtn =
    document.getElementById("startScanBtn");

if (startScanBtn) {

    startScanBtn.addEventListener("click", function() {

        window.location.href =
            "connect-device.html";

    });

}

// SCAN BUTTON FROM BOTTOM NAVIGATION

const scanNavBtn =
    document.getElementById("scanNavBtn");

if (scanNavBtn) {

    scanNavBtn.addEventListener("click", function() {

        window.location.href =
            "connect-device.html";

    });

}


// BOTTOM NAVIGATION

const homeButton =
    document.querySelector(
        ".bottom-nav button:nth-child(1)"
    );

if (homeButton) {

    homeButton.addEventListener("click", function() {

        window.location.href =
            "dashboard.html";

    });

}


const farmsButton =
    document.querySelector(
        ".bottom-nav button:nth-child(2)"
    );

if (farmsButton) {

    farmsButton.addEventListener("click", function() {

        window.location.href =
            "farms.html";

    });

}


const historyButton =
    document.querySelector(
        ".bottom-nav button:nth-child(4)"
    );

if (historyButton) {

    historyButton.addEventListener("click", function() {

        window.location.href =
            "scan-history.html";

    });

}


const settingsButton =
    document.querySelector(
        ".bottom-nav button:nth-child(5)"
    );

if (settingsButton) {

    settingsButton.addEventListener("click", function() {

        window.location.href =
            "settings.html";

    });

}

// CONNECT DEVICE PAGE

const connectBackButton =
    document.getElementById("backToDashboard");

if (connectBackButton) {

    connectBackButton.addEventListener("click", function() {

        window.location.href =
            "dashboard.html";

    });

}

// DEVICE SEARCH

const searchingBox =
    document.getElementById("searchingBox");

const deviceFound =
    document.getElementById("deviceFound");

const connectedBox =
    document.getElementById("connectedBox");


if (
    searchingBox &&
    deviceFound &&
    connectedBox
) {

    setTimeout(function() {

        searchingBox.classList.add("hidden");

        deviceFound.classList.remove("hidden");

    }, 5000);

}


// CONNECT DEVICE

const connectBtn =
    document.getElementById("connectBtn");

if (connectBtn) {

    connectBtn.addEventListener("click", function() {

        deviceFound.classList.add("hidden");

        connectedBox.classList.remove("hidden");

    });

}


// START SOIL SCAN

const scanNowBtn =
    document.getElementById("scanNowBtn");

if (scanNowBtn) {

    scanNowBtn.addEventListener("click", function() {

        window.location.href =
            "soil-scan.html";

    });

}


// SOIL SCAN PAGE

const backToConnect =
    document.getElementById("backToConnect");

if (backToConnect) {

    backToConnect.addEventListener("click", function() {

        window.location.href =
            "connect-device.html";

    });

}

// SOIL SCAN ELEMENTS

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const scanningArea =
    document.getElementById("scanningArea");

const scanCompleted =
    document.getElementById("scanCompleted");


const phValue =
    document.getElementById("phValue");

const moistureValue =
    document.getElementById("moistureValue");

const temperatureValue =
    document.getElementById("temperatureValue");

const nitrogenValue =
    document.getElementById("nitrogenValue");

const phosphorusValue =
    document.getElementById("phosphorusValue");

const potassiumValue =
    document.getElementById("potassiumValue");


// LOAD LATEST SCAN

async function loadLatestScan() {

    try {

        const response =
            await fetch(
                "http://localhost:3000/api/scans"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch scan data"
            );

        }


        const scans =
            await response.json();


        if (!scans || scans.length === 0) {

            console.log(
                "No scan data found."
            );

            return;

        }


        const scan =
            scans[0];


        if (moistureValue) {

            moistureValue.textContent =
                `${scan.moisture}%`;

        }


        if (temperatureValue) {

            temperatureValue.textContent =
                `${scan.temperature}°C`;

        }


        /*
         * القيم دي مؤقتة Prototype
         * لحد ما نوصل حساس التربة الحقيقي.
         */

        if (phValue) {

            phValue.textContent =
                "6.4";

        }


        if (nitrogenValue) {

            nitrogenValue.textContent =
                "18";

        }


        if (phosphorusValue) {

            phosphorusValue.textContent =
                "32";

        }


        if (potassiumValue) {

            potassiumValue.textContent =
                "15";

        }


        console.log(
            "Latest scan loaded:",
            scan
        );


    } catch (error) {

        console.error(
            "Error loading latest scan:",
            error
        );

    }

}

// SOIL SCAN PROGRESS

if (
    progressFill &&
    progressText
) {

    let progress = 0;


    const scanInterval =
        setInterval(async function() {

            progress += 5;


            progressFill.style.width =
                progress + "%";


            progressText.textContent =
                progress + "%";


            if (
                progress >= 15 &&
                phValue
            ) {

                phValue.textContent =
                    "جاري القياس...";

            }


            if (
                progress >= 30 &&
                moistureValue
            ) {

                moistureValue.textContent =
                    "جاري القياس...";

            }


            if (
                progress >= 45 &&
                temperatureValue
            ) {

                temperatureValue.textContent =
                    "جاري القياس...";

            }


            if (
                progress >= 60 &&
                nitrogenValue
            ) {

                nitrogenValue.textContent =
                    "18";

            }


            if (
                progress >= 75 &&
                phosphorusValue
            ) {

                phosphorusValue.textContent =
                    "32";

            }


            if (
                progress >= 90 &&
                potassiumValue
            ) {

                potassiumValue.textContent =
                    "15";

            }


            if (progress >= 100) {

                clearInterval(scanInterval);


                await loadLatestScan();


                setTimeout(function() {

                    if (scanningArea) {

                        scanningArea.classList.add(
                            "hidden"
                        );

                    }


                    if (scanCompleted) {

                        scanCompleted.classList.remove(
                            "hidden"
                        );

                    }

                }, 500);

            }


        }, 200);

}

// VIEW ANALYSIS

const viewAnalysisBtn =
    document.getElementById(
        "viewAnalysisBtn"
    );

if (viewAnalysisBtn) {

    viewAnalysisBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "analysis.html";

        }
    );

}


// SCAN HISTORY PAGE

const historyBackButton =
    document.getElementById(
        "backToDashboard"
    );

if (historyBackButton) {

    historyBackButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "dashboard.html";

        }
    );

}


const historyNewScan =
    document.getElementById(
        "historyNewScan"
    );

if (historyNewScan) {

    historyNewScan.addEventListener(
        "click",
        function() {

            window.location.href =
                "connect-device.html";

        }
    );

}


const historyViewButtons =
    document.querySelectorAll(
        ".history-view-btn"
    );


historyViewButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            window.location.href =
                "analysis.html";

        }
    );

});


// FARMS PAGE

const backToDashboardFromFarms =
    document.getElementById(
        "backToDashboardFromFarms"
    );

if (backToDashboardFromFarms) {

    backToDashboardFromFarms.addEventListener(
        "click",
        function() {

            window.location.href =
                "dashboard.html";

        }
    );

}


const addFarmBtn =
    document.getElementById("addFarmBtn");

if (addFarmBtn) {

    addFarmBtn.addEventListener(
        "click",
        function() {

            alert(
                "Add Farm feature will be available soon."
            );

        }
    );

}


const farmViewButtons =
    document.querySelectorAll(
        ".farm-view-btn"
    );


farmViewButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            window.location.href =
                "analysis.html";

        }
    );

});


// SETTINGS PAGE

const backToDashboardFromSettings =
    document.getElementById(
        "backToDashboardFromSettings"
    );

if (backToDashboardFromSettings) {

    backToDashboardFromSettings.addEventListener(
        "click",
        function() {

            window.location.href =
                "dashboard.html";

        }
    );

}


const notificationToggle =
    document.getElementById(
        "notificationToggle"
    );

if (notificationToggle) {

    notificationToggle.addEventListener(
        "change",
        function() {

            if (this.checked) {

                alert(
                    "Notifications enabled."
                );

            } else {

                alert(
                    "Notifications disabled."
                );

            }

        }
    );

}


const languageBtn =
    document.getElementById("languageBtn");

if (languageBtn) {

    languageBtn.addEventListener(
        "click",
        function() {

            const languageText =
                document.getElementById(
                    "languageText"
                );


            if (
                languageText &&
                languageText.textContent === "English"
            ) {

                languageText.textContent =
                    "Arabic";

            }

            else if (languageText) {

                languageText.textContent =
                    "English";

            }

        }
    );

}


const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (confirmLogout) {

                window.location.href =
                    "login.html";

            }

        }
    );

}