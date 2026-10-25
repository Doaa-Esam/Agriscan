
// GO TO REGISTER
const showRegister =
    document.getElementById(
        "showRegister"
    );

if (showRegister) {

    showRegister.addEventListener(
        "click",
        function() {

            window.location.href =
                "register.html";

        }
    );

}


// GO TO LOGIN
const showLogin =
    document.getElementById(
        "showLogin"
    );

if (showLogin) {

    showLogin.addEventListener(
        "click",
        function() {

            window.location.href =
                "login.html";

        }
    );

}

// START NEW SOIL SCAN
const startScanBtn =
    document.getElementById(
        "startScanBtn"
    );

if (startScanBtn) {

    startScanBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "farms.html?action=scan";

        }
    );

}


// SCAN BUTTON FROM BOTTOM NAVIGATION
const scanNavBtn =
    document.getElementById(
        "scanNavBtn"
    );

if (scanNavBtn) {

    scanNavBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "farms.html?action=scan";

        }
    );

}

// HOME BOTTOM
const homeButton =
    document.querySelector(
        ".bottom-nav button:nth-child(1)"
    );

if (homeButton) {

    homeButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "dashboard.html";

        }
    );

}

const farmsButton =
    document.querySelector(
        ".bottom-nav button:nth-child(2)"
    );

if (farmsButton) {

    farmsButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "farms.html";

        }
    );

}


const historyButton =
    document.querySelector(
        ".bottom-nav button:nth-child(4)"
    );

if (historyButton) {

    historyButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "scan-history.html";
        }
    );

}


const settingsButton =
    document.querySelector(
        ".bottom-nav button:nth-child(5)"
    );

if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "settings.html";

        }
    );

}
// SOIL SCAN PAGE
const isSoilScanPage =
    window.location.pathname.endsWith(
        "soil-scan.html"
    );


if (isSoilScanPage) {

    // API
    const soilScanAPI =
    "https://accelerator-standard-giraffe.abasthan.app/api";

    // GET FARM ID
    const soilScanParams =
        new URLSearchParams(
            window.location.search
        );


    const soilScanFarmId =
        soilScanParams.get(
            "farmId"
        );


    // GET CONNECTED DEVICE
    const soilScanDeviceCode =
        sessionStorage.getItem(
            "agriscan_device_code"
        );


    const connectedFarmId =
        sessionStorage.getItem(
            "agriscan_farm_id"
        );


    console.log(
        "Soil Scan Device Code:",
        soilScanDeviceCode
    );


    console.log(
        "Soil Scan Farm ID:",
        soilScanFarmId
    );


    console.log(
        "Connected Farm ID:",
        connectedFarmId
    );

    // CURRENT SCAN
    let startingScanId = 0;

    let currentScanId = null;

    let scanRequestId = null;

    // ELEMENTS
    const backToConnect =
        document.getElementById(
            "backToConnect"
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    const progressText =
        document.getElementById(
            "progressText"
        );


    const scanningArea =
        document.getElementById(
            "scanningArea"
        );


    const scanCompleted =
        document.getElementById(
            "scanCompleted"
        );


    const phValue =
        document.getElementById(
            "phValue"
        );


    const moistureValue =
        document.getElementById(
            "moistureValue"
        );


    const temperatureValue =
        document.getElementById(
            "temperatureValue"
        );


    const nitrogenValue =
        document.getElementById(
            "nitrogenValue"
        );


    const phosphorusValue =
        document.getElementById(
            "phosphorusValue"
        );


    const potassiumValue =
        document.getElementById(
            "potassiumValue"
        );


    const viewAnalysisBtn =
        document.getElementById(
            "viewAnalysisBtn"
        );


    // BACK TO CONNECT DEVICE
    if (backToConnect) {

        backToConnect.addEventListener(
            "click",
            function() {

                if (soilScanFarmId) {

                    window.location.href =
                        `connect-device.html?farmId=${soilScanFarmId}`;

                }

                else {

                    window.location.href =
                        "farms.html";

                }

            }
        );

    }


    // AUTH TOKEN
    function getAuthToken() {

        const token =
            localStorage.getItem(
                "agriscan_token"
            );


        if (!token) {

            window.location.href =
                "login.html";

            return null;

        }


        return token;

    }


    // GET USER SCANS
    async function getScans() {

        const token =
            getAuthToken();


        if (!token) {
            return null;
        }


        let url =
            `${soilScanAPI}/scans`;


        if (soilScanFarmId) {

            url +=
                `?farm_id=${soilScanFarmId}`;

        }


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        // AUTH ERROR
        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "agriscan_token"
            );


            localStorage.removeItem(
                "agriscan_user"
            );


            window.location.href =
                "login.html";


            return null;

        }


        if (!response.ok) {

            throw new Error(
                "فشل تحميل بيانات الفحص."
            );

        }


        return await response.json();

    }


    // LOAD LATEST EXISTING SCAN
    async function loadLatestScan() {

        try {

            const scans =
                await getScans();


            if (
                !Array.isArray(scans) ||
                scans.length === 0
            ) {

                console.log(
                    "No previous scans found."
                );


                return null;

            }


            const latestScan =
                scans.reduce(
                    function(latest, scan) {

                        if (
                            !latest ||
                            Number(scan.id) >
                            Number(latest.id)
                        ) {

                            return scan;

                        }


                        return latest;

                    },
                    null
                );


            console.log(
                "Latest existing scan:",
                latestScan
            );


            return latestScan;

        }
        catch (error) {

            console.error(
                "Error loading latest scan:",
                error
            );


            return null;

        }

    }


    // CREATE REAL SCAN REQUEST
    async function createScanRequest() {

        const token =
            getAuthToken();


        if (!token) {
            return null;
        }

        // CHECK FARM
        if (!soilScanFarmId) {

            alert(
                "لم يتم تحديد المزرعة."
            );


            return null;

        }

        // CHECK DEVICE
        if (!soilScanDeviceCode) {

            alert(
                "لم يتم توصيل جهاز AgriScan."
            );


            window.location.href =
                `connect-device.html?farmId=${soilScanFarmId}`;


            return null;

        }


        // VERIFY CONNECTED FARM
        if (
            connectedFarmId &&
            Number(connectedFarmId) !==
            Number(soilScanFarmId)
        ) {

            alert(
                "الجهاز متصل بمزرعة مختلفة."
            );


            window.location.href =
                `connect-device.html?farmId=${soilScanFarmId}`;


            return null;

        }


        try {

            const response =
                await fetch(
                    `${soilScanAPI}/scan-requests`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            device_code:
                                soilScanDeviceCode,

                            farm_id:
                                Number(
                                    soilScanFarmId
                                )

                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "Scan request response:",
                data
            );


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "agriscan_token"
                );


                localStorage.removeItem(
                    "agriscan_user"
                );


                window.location.href =
                    "login.html";


                return null;

            }


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "تعذر إنشاء طلب الفحص."
                );

            }


            scanRequestId =
                Number(
                    data.scan_request_id
                );


            console.log(
                "Scan Request ID:",
                scanRequestId
            );


            return data;

        }
        catch (error) {

            console.error(
                "Error creating scan request:",
                error
            );


            alert(
                error.message ||
                "تعذر بدء فحص التربة."
            );


            return null;

        }

    }

    // DISPLAY REAL MEASUREMENTS
    function displayScanData(scan) {

        if (!scan) {
            return;
        }


        // MOISTURE
        if (moistureValue) {

            if (
                scan.moisture !== null &&
                scan.moisture !== undefined
            ) {

                moistureValue.textContent =
                    `${scan.moisture}%`;

            }

            else {

                moistureValue.textContent =
                    "غير متاح";

            }

        }


        // TEMPERATURE
        if (temperatureValue) {

            if (
                scan.temperature !== null &&
                scan.temperature !== undefined
            ) {

                temperatureValue.textContent =
                    `${scan.temperature}°C`;

            }

            else {

                temperatureValue.textContent =
                    "غير متاح";

            }

        }


        // pH
        if (phValue) {

            phValue.textContent =
                scan.ph !== null &&
                scan.ph !== undefined
                    ? scan.ph
                    : "غير متاح";

        }

        // NITROGEN
        if (nitrogenValue) {

            nitrogenValue.textContent =
                scan.nitrogen !== null &&
                scan.nitrogen !== undefined
                    ? scan.nitrogen
                    : "غير متاح";

        }


        // PHOSPHORUS
        if (phosphorusValue) {

            phosphorusValue.textContent =
                scan.phosphorus !== null &&
                scan.phosphorus !== undefined
                    ? scan.phosphorus
                    : "غير متاح";

        }


        // POTASSIUM
        if (potassiumValue) {

            potassiumValue.textContent =
                scan.potassium !== null &&
                scan.potassium !== undefined
                    ? scan.potassium
                    : "غير متاح";

        }


        console.log(
            "Real scan data displayed:",
            scan
        );

    }


    // SHOW MEASUREMENT IN PROGRESS
    function showMeasurementProgress() {

        if (
            !progressText ||
            !progressFill
        ) {
            return;
        }


        let progress =
            0;


        const progressInterval =
            setInterval(
                function() {

                    if (progress < 95) {

                        progress += 5;

                    }


                    progressFill.style.width =
                        `${progress}%`;


                    progressText.textContent =
                        `${progress}%`;


                    // MEASUREMENT STATUS
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
                            "جاري القياس...";

                    }


                    if (
                        progress >= 75 &&
                        phosphorusValue
                    ) {

                        phosphorusValue.textContent =
                            "جاري القياس...";

                    }


                    if (
                        progress >= 90 &&
                        potassiumValue
                    ) {

                        potassiumValue.textContent =
                            "جاري القياس...";

                    }

                },
                250
            );


        return progressInterval;

    }

    // WAIT FOR REAL NEW SCAN
    async function waitForNewScan() {

        const maxAttempts =
            60;


        const delay =
            1000;


        for (
            let attempt = 1;
            attempt <= maxAttempts;
            attempt++
        ) {

            try {

                console.log(
                    `Waiting for real scan... ${attempt}/${maxAttempts}`
                );


                const scans =
                    await getScans();


                if (
                    Array.isArray(scans) &&
                    scans.length > 0
                ) {


                    // FIND REAL NEW SCANS
                    const newScans =
                        scans.filter(
                            function(scan) {

                                const scanId =
                                    Number(
                                        scan.id
                                    );


                                const scanFarmId =
                                    Number(
                                        scan.farm_id
                                    );


                                const scanDeviceId =
                                    Number(
                                        scan.device_id
                                    );


                                const connectedDeviceId =
                                    Number(
                                        sessionStorage.getItem(
                                            "agriscan_device_id"
                                        )
                                    );


                                return (
                                    scanId >
                                    Number(
                                        startingScanId
                                    )
                                    &&
                                    scanFarmId ===
                                    Number(
                                        soilScanFarmId
                                    )
                                    &&
                                    (
                                        !connectedDeviceId ||
                                        scanDeviceId ===
                                        connectedDeviceId
                                    )
                                );

                            }
                        );

                      // CHECK NEW SCAN
                    if (
                        newScans.length > 0
                    ) {

                        const newScan =
                            newScans.reduce(
                                function(
                                    latest,
                                    scan
                                ) {

                                    if (
                                        !latest ||
                                        Number(scan.id) >
                                        Number(latest.id)
                                    ) {

                                        return scan;

                                    }


                                    return latest;

                                },
                                null
                            );


                        if (newScan) {

                            currentScanId =
                                Number(
                                    newScan.id
                                );


                            console.log(
                                "REAL NEW SCAN DETECTED:",
                                newScan
                            );


                            return newScan;

                        }

                    }

                }

            }
            catch (error) {

                console.error(
                    "Error while waiting for scan:",
                    error
                );

            }

            // WAIT 1 SECOND
            await new Promise(
                function(resolve) {

                    setTimeout(
                        resolve,
                        delay
                    );

                }
            );

        }

        // NO NEW SCAN
        return null;

    }


    // COMPLETE SCAN
    function completeScan(
        scan
    ) {

        // DISPLAY REAL DATA
        displayScanData(
            scan
        );

        // PROGRESS = 100%
        if (progressFill) {

            progressFill.style.width =
                "100%";

        }


        if (progressText) {

            progressText.textContent =
                "100%";

        }

        // SHOW COMPLETED SCREEN
        setTimeout(
            function() {

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

            },
            500
        );

        // DEBUG
        console.log(
            "Scan completed successfully."
        );


        console.log(
            "Scan Request ID:",
            scanRequestId
        );


        console.log(
            "Current Scan ID:",
            currentScanId
        );

    }

    // START SOIL SCAN
    async function startSoilScan() {

        // VALIDATE FARM
        if (!soilScanFarmId) {

            alert(
                "لم يتم تحديد المزرعة."
            );


            window.location.href =
                "farms.html";


            return;

        }

        // GET LAST EXISTING SCAN
        const latestScan =
            await loadLatestScan();


        if (latestScan) {

            startingScanId =
                Number(
                    latestScan.id
                );

        }

        else {

            startingScanId =
                0;

        }


        console.log(
            "Starting Scan ID:",
            startingScanId
        );

        // CREATE REAL SCAN REQUEST
        const scanRequest =
            await createScanRequest();


        if (!scanRequest) {

            return;

        }

        // START VISUAL PROGRESS
        const progressInterval =
            showMeasurementProgress();

        // WAIT FOR REAL ESP32 SCAN
        const newScan =
            await waitForNewScan();

        // STOP PROGRESS
        clearInterval(
            progressInterval
        );

        // NO REAL RESULT
        if (!newScan) {

            console.error(
                "No real scan result received."
            );


            if (progressFill) {

                progressFill.style.width =
                    "95%";

            }


            if (progressText) {

                progressText.textContent =
                    "95%";

            }


            alert(
                "الفحص لم يكتمل بعد. تأكدي من تشغيل جهاز AgriScan واتصاله بالـ Backend."
            );


            return;

        }

        // REAL SCAN COMPLETED
        completeScan(
            newScan
        );

    }

    // START SCAN
    startSoilScan();

    // VIEW ANALYSIS
    if (viewAnalysisBtn) {

        viewAnalysisBtn.addEventListener(
            "click",
            function() {

                if (
                    soilScanFarmId &&
                    currentScanId
                ) {

                    window.location.href =
                        `analysis.html?farmId=${soilScanFarmId}&scanId=${currentScanId}`;

                }

                else {

                    console.error(
                        "No current scan ID available."
                    );


                    alert(
                        "نتيجة الفحص غير متاحة حاليًا."
                    );

                }

            }
        );

    }

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
                "farms.html?action=scan";
        }
    );

}

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

// NOTIFICATIONS
const notificationToggle =
    document.getElementById(
        "notificationToggle"
    );

if (notificationToggle) {

    const savedNotificationSetting =
        localStorage.getItem(
            "agriscan_notifications"
        );

    if (savedNotificationSetting !== null) {

        notificationToggle.checked =
            savedNotificationSetting === "enabled";

    }


    notificationToggle.addEventListener(
        "change",
        function() {

            if (this.checked) {

                localStorage.setItem(
                    "agriscan_notifications",
                    "enabled"
                );

            }

            else {

                localStorage.setItem(
                    "agriscan_notifications",
                    "disabled"
                );

            }

        }
    );

}


// LANGUAGE
const languageBtn =
    document.getElementById(
        "languageBtn"
    );

if (languageBtn) {

    languageBtn.addEventListener(
        "click",
        function() {
            window.location.href =
                "language.html";
        }
    );

}

// DEVICE DETAILS PAGE
const deviceDetailsBtn =
    document.getElementById(
        "deviceDetailsBtn"
    );

if (deviceDetailsBtn) {

    deviceDetailsBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "device-details.html";

        }
    );

}

// SUPPORT PAGE
const supportBtn =
    document.getElementById(
        "supportBtn"
    );

if (supportBtn) {

    supportBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "support.html";

        }
    );

}


// ABOUT AGRISCAN PAGE
const aboutBtn =
    document.getElementById(
        "aboutBtn"
    );

if (aboutBtn) {

    aboutBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "about.html";

        }
    );

}

// PROFILE PAGE
const profileBtn =
    document.getElementById(
        "profileBtn"
    );

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "profile.html";

        }
    );

}

// CHANGE PASSWORD PAGE
const passwordBtn =
    document.getElementById(
        "passwordBtn"
    );

if (passwordBtn) {

    passwordBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "change-password.html";

        }
    );

}

// LOGOUT
const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "هل أنت متأكد من تسجيل الخروج؟"
                );

            if (confirmLogout) {

                localStorage.removeItem(
                    "agriscan_token"
                );

                localStorage.removeItem(
                    "agriscan_user"
                );

                localStorage.removeItem(
                    "agriscan_notifications"
                );

                sessionStorage.removeItem(
                    "agriscan_device_code"
                );

                sessionStorage.removeItem(
                    "agriscan_device_id"
                );

                sessionStorage.removeItem(
                    "agriscan_farm_id"
                );

                sessionStorage.removeItem(
                    "agriscan_farm_name"
                );


                window.location.href =
                    "login.html";

            }

        }
    );

}

// SETTINGS DATA
const APP_API_URL = "https://accelerator-standard-giraffe.abasthan.app/api";

// LOAD ACCOUNT DATA
async function loadSettingsAccount() {

    const token =
        localStorage.getItem(
            "agriscan_token"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    if (!profileEmail) {
        return;
    }

    if (!token) {

        profileEmail.textContent =
            "لم يتم تسجيل الدخول";

        return;
    }

    try {

        const response =
            await fetch(
                `${APP_API_URL}/auth/me`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "agriscan_token"
            );

            localStorage.removeItem(
                "agriscan_user"
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Failed to load account data"
            );

        }


        const user =
            await response.json();


        profileEmail.textContent =
            user.email ||
            "البريد الإلكتروني غير متاح";


    }

    catch (error) {

        console.error(
            "خطأ في تحميل بيانات الحساب:",
            error
        );

        profileEmail.textContent =
            "تعذر تحميل بيانات الحساب";

    }

}

// LOAD DEVICE DATA
async function loadSettingsDevice() {
    const deviceName = document.getElementById("deviceName");
    const deviceFarm = document.getElementById("deviceFarm");
    const deviceStatus = document.getElementById("deviceStatus");

    if (!deviceName || !deviceFarm || !deviceStatus) {
        return;
    }

    const token = localStorage.getItem("agriscan_token");

    if (!token) {
        deviceName.textContent = "جهاز AgriScan";
        deviceFarm.textContent = "سجّلي الدخول لعرض بيانات الجهاز";
        deviceStatus.textContent = "غير متاح";
        return;
    }

    try {
        const response = await fetch(
            `${APP_API_URL}/devices/my-device`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("agriscan_token");
            localStorage.removeItem("agriscan_user");
            window.location.href = "login.html";
            return;
        }

        if (response.status === 404) {
            deviceName.textContent = "جهاز AgriScan";
            deviceFarm.textContent = "لا يوجد جهاز مرتبط بحسابك";
            deviceStatus.textContent = "غير مرتبط";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load user device");
        }

        const device = await response.json();

        deviceName.textContent = device.name || "جهاز AgriScan";
        deviceFarm.textContent = device.farm_name
            ? `مرتبط بـ ${device.farm_name}`
            : "غير مرتبط بمزرعة";

        if (device.status === "CONNECTED") {
            deviceStatus.textContent = "متصل";
        } else if (device.status === "DISCONNECTED") {
            deviceStatus.textContent = "غير متصل";
        } else {
            deviceStatus.textContent = "حالة الاتصال غير محددة";
        }

    } catch (error) {
        console.error("خطأ في تحميل بيانات الجهاز:", error);
        deviceName.textContent = "جهاز AgriScan";
        deviceFarm.textContent = "تعذر تحميل بيانات الجهاز";
        deviceStatus.textContent = "غير متاح";
    }
}

// START SETTINGS DATA
loadSettingsAccount();

loadSettingsDevice();

// FARMS PAGE BACK BUTTON
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