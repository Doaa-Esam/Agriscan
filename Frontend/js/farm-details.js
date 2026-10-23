
// AGRISCAN - FARM DETAILS
const FARM_DETAILS_API_URL = "https://accelerator-standard-giraffe.abasthan.app/api";

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


// GET FARM ID
const params = new URLSearchParams(
    window.location.search
);

const farmId = params.get("id");


// GET ELEMENTS
const farmName =
    document.getElementById("farmName");

const farmLocation =
    document.getElementById("farmLocation");

const farmArea =
    document.getElementById("farmArea");

const farmCrop =
    document.getElementById("farmCrop");

const scanCount =
    document.getElementById("scanCount");

const latestScan =
    document.getElementById("latestScan");

const farmScans =
    document.getElementById("farmScans");

const backToFarms =
    document.getElementById("backToFarms");

const newFarmScan =
    document.getElementById("newFarmScan");


// LOAD FARM DETAILS
async function loadFarmDetails() {

    if (!farmId) {

        if (farmName) {
            farmName.textContent =
                "المزرعة غير محددة";
        }

        if (farmLocation) {
            farmLocation.textContent =
                "لم يتم تحديد مزرعة";
        }

        return;
    }


    try {

        const authHeaders =
        getAuthHeaders();


        if (!authHeaders) {
           return;
        }


       const response =
        await fetch(
            `${FARM_DETAILS_API_URL}/farms/${farmId}/details`,
            {
                method: "GET",

                headers: {
                    ...authHeaders
                }
            }
        );


        if (!response.ok) {

            throw new Error(
              "Failed to load farm details"
            );

        }


        const data =
            await response.json();


        const farm =
            data.farm;

        const scans =
            data.scans || [];
            const totalScans =
            Number(
            data.total_scans || 0
        );


        // FARM INFORMATION
        if (farmName) {

            farmName.textContent =
                farm.name;

        }


        if (farmLocation) {

            farmLocation.innerHTML = `
                <i class="fa-solid fa-location-dot"></i>
                ${farm.location || "الموقع غير محدد"}
            `;

        }


        if (farmArea) {

            farmArea.textContent =
                `${farm.area || 0}`;

        }


        if (farmCrop) {

            farmCrop.textContent =
                farm.crop_name || "غير محدد";

        }


        if (scanCount) {

            scanCount.textContent =
                totalScans;

        }


        // NO SCANS
        if (scans.length === 0) {

            if (latestScan) {

                latestScan.innerHTML = `
                    <div class="farm-empty-state">
                        <i class="fa-solid fa-flask"></i>
                        <p>
                            لا توجد فحوصات لهذه المزرعة حتى الآن.
                        </p>
                    </div>
                `;

            }


            if (farmScans) {

                farmScans.innerHTML = `
                    <div class="farm-empty-state">
                        <p>
                            ابدئي أول فحص للتربة لهذه المزرعة.
                        </p>
                    </div>
                `;

            }

            return;
        }


        // LATEST SCAN
        const latest =
            scans[0];


        const latestStatus =
            getStatusInfo(
                latest.status
            );


        const latestDate =
            new Date(
                latest.created_at
            );


        if (latestScan) {

            latestScan.innerHTML = `

                <div class="latest-scan-card">

                    <div class="latest-scan-top">

                        <div class="latest-scan-icon ${latestStatus.className}">

                            <i class="fa-solid ${latestStatus.icon}"></i>

                        </div>

                        <div>

                            <h3>
                                فحص #${latest.id}
                            </h3>

                            <span class="${latestStatus.textClass}">
                                ${latestStatus.text}
                            </span>

                        </div>

                    </div>


                    <div class="latest-scan-measurements">

                        <div>
                            <i class="fa-solid fa-droplet"></i>
                            <strong>
                                ${latest.moisture}%
                            </strong>
                            <span>
                                الرطوبة
                            </span>
                        </div>


                        <div>
                            <i class="fa-solid fa-temperature-half"></i>
                            <strong>
                                ${latest.temperature}°C
                            </strong>
                            <span>
                                الحرارة
                            </span>
                        </div>

                    </div>


                    <div class="latest-recommendation">

                        <i class="fa-solid fa-lightbulb"></i>

                        <div>
                            <strong>
                                التوصية
                            </strong>

                            <p>
                                ${latest.recommendation || "لا توجد توصية"}
                            </p>
                        </div>

                    </div>


                    <small class="latest-scan-date">
                        <i class="fa-regular fa-clock"></i>
                        ${latestDate.toLocaleString("ar-EG")}

                    </small>

                    <small class="latest-scan-date">
                        <i class="fa-solid fa-microchip"></i>
                        الجهاز:
                       ${latest.device_code || "غير مرتبط"}

                    </small>


                    <button
                        class="view-analysis-btn"
                        type="button"
                        data-id="${latest.id}">

                        <i class="fa-solid fa-chart-line"></i>

                        عرض التحليل

                    </button>

                </div>
            `;


            const analysisButton =
                latestScan.querySelector(
                    ".view-analysis-btn"
                );


            if (analysisButton) {

                analysisButton.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            `analysis.html?farmId=${farmId}`;

                    }
                );

            }

        }


        // ALL FARM SCANS
        if (farmScans) {

            farmScans.innerHTML = "";


            scans.forEach(function(scan) {

                const status =
                    getStatusInfo(
                        scan.status
                    );


                const date =
                    new Date(
                        scan.created_at
                    );


                const card =
                    document.createElement("div");


                card.className =
                    "farm-scan-card";


                card.innerHTML = `

                    <div class="farm-scan-icon ${status.className}">

                        <i class="fa-solid ${status.icon}"></i>

                    </div>


                    <div class="farm-scan-content">

                        <h3>
                            فحص #${scan.id}
                        </h3>

                        <span class="${status.textClass}">
                            ${status.text}
                        </span>

                        <p>
                            الرطوبة ${scan.moisture}%
                            •
                            ${scan.temperature}°C
                        </p>

                        <small>
                            <i class="fa-regular fa-clock"></i>
                            ${date.toLocaleString("ar-EG")}
                        </small>

                    </div>

                `;


                farmScans.appendChild(
                    card
                );

            });

        }


    } catch (error) {

        console.error(
            "Error loading farm details:",
            error
        );


        if (farmName) {

            farmName.textContent =
                "تعذر تحميل المزرعة";

        }


        if (farmLocation) {

            farmLocation.textContent =
                "تأكدي أن الـ Backend يعمل";

        }


        if (latestScan) {

            latestScan.innerHTML = `
                <div class="farm-empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>
                        حدث خطأ أثناء تحميل بيانات المزرعة.
                    </p>
                </div>
            `;

        }

    }

}

// MOISTURE STATUS INFORMATION
function getStatusInfo(status) {

    if (status === "NORMAL") {

        return {
            text: "حالة الرطوبة: طبيعية",
            className: "good",
            textClass: "good-text",
            icon: "fa-seedling"
        };

    }


    if (status === "DRY") {

        return {
            text: "حالة الرطوبة: منخفضة",
            className: "warning",
            textClass: "warning-text",
            icon: "fa-triangle-exclamation"
        };

    }


    if (status === "VERY_WET") {

        return {
            text: "حالة الرطوبة: مرتفعة",
            className: "warning",
            textClass: "warning-text",
            icon: "fa-droplet"
        };

    }


    return {
        text: "حالة الرطوبة: غير محددة",
        className: "warning",
        textClass: "warning-text",
        icon: "fa-circle-question"
    };

}


// BACK TO FARMS
if (backToFarms) {

    backToFarms.addEventListener(
        "click",
        function() {

            window.location.href =
                "farms.html";

        }
    );

}


// NEW SCAN
if (newFarmScan) {

    newFarmScan.addEventListener(
        "click",
        function() {

            if (farmId) {

                window.location.href =
                    `connect-device.html?farmId=${farmId}`;

            } else {

                window.location.href =
                    "connect-device.html";

            }

        }
    );

}


// START
loadFarmDetails();