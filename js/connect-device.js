
// API
const CONNECT_API_URL =
    "http://localhost:3000/api";


// PROTOTYPE DEVICE
const DEVICE_CODE =
    "AG-001";


// AUTHENTICATION
function getAuthHeaders() {

    const token =
        localStorage.getItem("agriscan_token");


    if (!token) {

        window.location.href =
            "login.html";

        return null;
    }


    return {
        "Authorization":
            `Bearer ${token}`
    };

}


// GET FARM ID FROM URL
const connectParams =
    new URLSearchParams(
        window.location.search
    );


const connectFarmId =
    connectParams.get("farmId");


console.log(
    "Connect Device Farm ID:",
    connectFarmId
);


// ELEMENTS
const searchingBox =
    document.getElementById(
        "searchingBox"
    );


const deviceFound =
    document.getElementById(
        "deviceFound"
    );


const connectedBox =
    document.getElementById(
        "connectedBox"
    );


const connectBtn =
    document.getElementById(
        "connectBtn"
    );


const scanNowBtn =
    document.getElementById(
        "scanNowBtn"
    );


const backToDashboard =
    document.getElementById(
        "backToDashboard"
    );


// BACK BUTTON
if (backToDashboard) {

    backToDashboard.addEventListener(
        "click",
        function() {

            if (connectFarmId) {

                window.location.href =
                    `farm-details.html?id=${connectFarmId}`;

            }

            else {

                window.location.href =
                    "dashboard.html";

            }

        }
    );

}

// CHECK DEVICE
async function checkDevice() {

    try {

        console.log(
            "Checking device:",
            DEVICE_CODE
        );


        const response =
            await fetch(
                `${CONNECT_API_URL}/devices/${DEVICE_CODE}`
            );


        if (!response.ok) {

            throw new Error(
                "جهاز AgriScan غير متاح حاليًا."
            );

        }


        const device =
            await response.json();


        console.log(
            "Device information:",
            device
        );

        // DEVICE EXISTS
        if (!device.device_code) {

            throw new Error(
                "لم يتم العثور على جهاز AgriScan."
            );

        }

        // SHOW DEVICE
        if (searchingBox) {

            searchingBox.classList.add(
                "hidden"
            );

        }


        if (deviceFound) {

            deviceFound.classList.remove(
                "hidden"
            );

        }


        // UPDATE DEVICE CODE
        const deviceCodeElement =
            deviceFound
                ? deviceFound.querySelector(
                    ".device-info strong"
                )
                : null;


        if (deviceCodeElement) {

            deviceCodeElement.textContent =
                device.device_code;

        }


    }
    catch (error) {

        console.error(
            "Device search error:",
            error
        );


        if (searchingBox) {

            searchingBox.innerHTML = `

                <div class="search-animation">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                </div>

                <h2>
                    تعذر العثور على الجهاز
                </h2>

                <p>
                    تأكدي من تشغيل جهاز AgriScan وأن الـ Backend يعمل.
                </p>

                <button
                    class="connect-btn"
                    id="retryDeviceBtn"
                    type="button">

                    <i class="fa-solid fa-rotate-right"></i>

                    إعادة البحث

                </button>

            `;

        }


        const retryDeviceBtn =
            document.getElementById(
                "retryDeviceBtn"
            );


        if (retryDeviceBtn) {

            retryDeviceBtn.addEventListener(
                "click",
                function() {

                    window.location.reload();

                }
            );

        }

    }

}


// DEVICE SEARCH
if (
    searchingBox &&
    deviceFound &&
    connectedBox
) {
    setTimeout(
        function() {

            checkDevice();

        },
        5000
    );

}


// CONNECT DEVICE
if (connectBtn) {

    connectBtn.addEventListener(
        "click",
        async function() {


            // CHECK FARM
            if (!connectFarmId) {

                alert(
                    "من فضلك اختر مزرعة أولاً."
                );


                window.location.href =
                    "farms.html";


                return;

            }


            // VALIDATE FARM ID
            const farmIdNumber =
                Number(
                    connectFarmId
                );


            if (
                !Number.isInteger(
                    farmIdNumber
                ) ||
                farmIdNumber <= 0
            ) {

                alert(
                    "بيانات المزرعة غير صحيحة."
                );


                window.location.href =
                    "farms.html";


                return;

            }

            // GET AUTHORIZATION
            const authHeaders =
                getAuthHeaders();


            if (!authHeaders) {
                return;
            }


            try {

                // DISABLE BUTTON
                connectBtn.disabled =
                    true;


                connectBtn.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    جاري الاتصال...

                `;


                // CONNECT DEVICE
                const response =
                    await fetch(
                        `${CONNECT_API_URL}/devices/connect`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...authHeaders
                            },

                            body: JSON.stringify({

                                device_code:
                                    DEVICE_CODE,

                                farm_id:
                                    farmIdNumber

                            })

                        }
                    );


                // RESPONSE
                const data =
                    await response.json();


                console.log(
                    "Device connect response:",
                    data
                );


                // ERROR
                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "تعذر توصيل الجهاز."
                    );

                }


                // VERIFY RESPONSE
                if (
                    !data.device_code ||
                    !data.device_id ||
                    !data.farm_id
                ) {

                    throw new Error(
                        "استجابة الاتصال غير مكتملة."
                    );

                }


                // VERIFY CONNECTED FARM
                if (
                    Number(
                        data.farm_id
                    ) !== farmIdNumber
                ) {

                    throw new Error(
                        "الجهاز لم يتم ربطه بالمزرعة المختارة."
                    );

                }

                // SAVE CONNECTED DEVICE
                sessionStorage.setItem(
                    "agriscan_device_code",
                    data.device_code
                );


                sessionStorage.setItem(
                    "agriscan_device_id",
                    data.device_id
                );


                sessionStorage.setItem(
                    "agriscan_farm_id",
                    data.farm_id
                );

                // SAVE FARM NAME
                if (data.farm_name) {

                    sessionStorage.setItem(
                        "agriscan_farm_name",
                        data.farm_name
                    );

                }


                console.log(
                    "Device connected successfully."
                );


                console.log(
                    "Device:",
                    data.device_code
                );


                console.log(
                    "Device ID:",
                    data.device_id
                );


                console.log(
                    "Farm ID:",
                    data.farm_id
                );


                console.log(
                    "Farm Name:",
                    data.farm_name
                );


                // UPDATE UI
                deviceFound.classList.add(
                    "hidden"
                );


                connectedBox.classList.remove(
                    "hidden"
                );


            }
            catch (error) {

                console.error(
                    "Error connecting device:",
                    error
                );


                alert(
                    error.message ||
                    "تعذر الاتصال بالجهاز."
                );


                connectBtn.disabled =
                    false;


                connectBtn.innerHTML = `

                    <i class="fa-solid fa-link"></i>

                    توصيل الجهاز

                `;

            }

        }
    );

}


// START SOIL SCAN
if (scanNowBtn) {

    scanNowBtn.addEventListener(
        "click",
        function() {

            // GET SESSION DATA
            const deviceCode =
                sessionStorage.getItem(
                    "agriscan_device_code"
                );


            const connectedFarmId =
                sessionStorage.getItem(
                    "agriscan_farm_id"
                );


            // CHECK DEVICE
            if (!deviceCode) {

                alert(
                    "يجب توصيل الجهاز أولاً."
                );

                return;

            }


            // CHECK FARM
            if (!connectFarmId) {

                alert(
                    "لم يتم تحديد المزرعة."
                );

                window.location.href =
                    "farms.html";

                return;

            }


            // VERIFY FARM MATCH
            if (
                Number(
                    connectedFarmId
                ) !== Number(
                    connectFarmId
                )
            ) {

                alert(
                    "الجهاز متصل بمزرعة مختلفة. يرجى إعادة الاتصال."
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


                window.location.href =
                    `connect-device.html?farmId=${connectFarmId}`;


                return;

            }


            // START SOIL SCAN
            console.log(
                "Starting soil scan for farm:",
                connectFarmId
            );


            window.location.href =
                `soil-scan.html?farmId=${connectFarmId}`;

        }
    );

}