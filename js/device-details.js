
// DEVICE DETAILS PAGE
const DEVICE_DETAILS_API_URL =
    "http://localhost:3000/api";


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

    const deviceName =
        document.getElementById(
            "deviceName"
        );

    const deviceCode =
        document.getElementById(
            "deviceCode"
        );

    const deviceStatus =
        document.getElementById(
            "deviceStatus"
        );

    const deviceFarm =
        document.getElementById(
            "deviceFarm"
        );

    const deviceConnectedAt =
        document.getElementById(
            "deviceConnectedAt"
        );


    if (
        !deviceName ||
        !deviceCode ||
        !deviceStatus ||
        !deviceFarm ||
        !deviceConnectedAt
    ) {
        return;
    }


    // GET DEVICE CODE
    const savedDeviceCode =
        sessionStorage.getItem(
            "agriscan_device_code"
        ) || "AG-001";


    try {

        const response =
            await fetch(
                `${DEVICE_DETAILS_API_URL}/devices/${encodeURIComponent(savedDeviceCode)}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load device details"
            );

        }


        const device =
            await response.json();


        // DEVICE NAME
        deviceName.textContent =
            device.name ||
            "غير متاح";


        // DEVICE CODE
        deviceCode.textContent =
            device.device_code ||
            savedDeviceCode;


        // DEVICE STATUS
        if (
            device.status ===
            "CONNECTED"
        ) {

            deviceStatus.textContent =
                "متصل";

        } else if (
            device.status ===
            "DISCONNECTED"
        ) {

            deviceStatus.textContent =
                "غير متصل";

        } else {

            deviceStatus.textContent =
                "غير محدد";

        }


        // CONNECTED FARM
        deviceFarm.textContent =
            device.farm_name
                ? device.farm_name
                : "غير مرتبط بمزرعة";


        // CONNECTION DATE
        if (device.connected_at) {

            const connectedDate =
                new Date(
                    device.connected_at
                );


            if (
                !Number.isNaN(
                    connectedDate.getTime()
                )
            ) {

                deviceConnectedAt.textContent =
                    connectedDate.toLocaleString(
                        "ar-EG",
                        {
                            dateStyle:
                                "medium",
                            timeStyle:
                                "short"
                        }
                    );

            } else {

                deviceConnectedAt.textContent =
                    "غير متاح";

            }

        } else {

            deviceConnectedAt.textContent =
                "غير متاح";

        }

    } catch (error) {

        console.error(
            "خطأ في تحميل بيانات الجهاز:",
            error
        );


        deviceName.textContent =
            "تعذر تحميل البيانات";

        deviceCode.textContent =
            "تعذر تحميل البيانات";

        deviceStatus.textContent =
            "غير متاح";

        deviceFarm.textContent =
            "تعذر تحميل البيانات";

        deviceConnectedAt.textContent =
            "غير متاح";

    }

}

loadDeviceDetails();