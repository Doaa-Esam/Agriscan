
// DEVICE DETAILS PAGE
const DEVICE_DETAILS_API_URL =
    "https://accelerator-standard-giraffe.abasthan.app/api";


// BACK TO SETTINGS
const backToSettings =
    document.getElementById(
        "backToSettings"
    );

if (backToSettings) {

    backToSettings.addEventListener(
        "click",
        function() {

            window.location.href =
                "settings.html";

        }
    );

}


// LOAD DEVICE DETAILS
async function loadDeviceDetails() {
    const deviceName = document.getElementById("deviceName");
    const deviceCode = document.getElementById("deviceCode");
    const deviceStatus = document.getElementById("deviceStatus");
    const deviceFarm = document.getElementById("deviceFarm");
    const deviceConnectedAt = document.getElementById("deviceConnectedAt");

    if (
        !deviceName ||
        !deviceCode ||
        !deviceStatus ||
        !deviceFarm ||
        !deviceConnectedAt
    ) {
        return;
    }

    const token = localStorage.getItem("agriscan_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    function showNoDevice() {
        deviceName.textContent = "جهاز AgriScan";
        deviceCode.textContent = "غير متاح";
        deviceStatus.textContent = "غير مرتبط";
        deviceFarm.textContent = "لا يوجد جهاز مرتبط بحسابك";
        deviceConnectedAt.textContent = "غير متاح";
    }

    try {
        const response = await fetch(
            `${DEVICE_DETAILS_API_URL}/devices/my-device`,
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
            showNoDevice();
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load device details");
        }

        const device = await response.json();

        deviceName.textContent = device.name || "جهاز AgriScan";
        deviceCode.textContent = device.device_code || "غير متاح";
        deviceFarm.textContent = device.farm_name || "غير مرتبط بمزرعة";

        if (device.status === "CONNECTED") {
            deviceStatus.textContent = "متصل";
        } else if (device.status === "DISCONNECTED") {
            deviceStatus.textContent = "غير متصل";
        } else {
            deviceStatus.textContent = "حالة الاتصال غير محددة";
        }

        if (device.connected_at) {
            const connectedDate = new Date(device.connected_at);

            deviceConnectedAt.textContent =
                !Number.isNaN(connectedDate.getTime())
                    ? connectedDate.toLocaleString("ar-EG", {
                        dateStyle: "medium",
                        timeStyle: "short"
                    })
                    : "غير متاح";
        } else {
            deviceConnectedAt.textContent = "غير متاح";
        }

    } catch (error) {
        console.error("خطأ في تحميل بيانات الجهاز:", error);

        deviceName.textContent = "تعذر تحميل البيانات";
        deviceCode.textContent = "غير متاح";
        deviceStatus.textContent = "غير متاح";
        deviceFarm.textContent = "تعذر تحميل بيانات الجهاز";
        deviceConnectedAt.textContent = "غير متاح";
    }
}

loadDeviceDetails();