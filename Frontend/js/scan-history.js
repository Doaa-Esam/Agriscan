
// AGRISCAN - SCAN HISTORY
const SCAN_HISTORY_API_URL =
    "https://accelerator-standard-giraffe.abasthan.app/api";


// AUTHENTICATION
function getAuthHeaders() {

    const token =
        localStorage.getItem(
            "agriscan_token"
        );

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


// PAGE ELEMENTS
const totalScans =
    document.getElementById(
        "totalScans"
    );

const goodScans =
    document.getElementById(
        "goodScans"
    );

const historyContent =
    document.getElementById(
        "historyContent"
    );


// STATUS INFORMATION
function getStatusInfo(status) {

    if (status === "NORMAL") {

        return {

            text:
                "حالة الرطوبة: طبيعية",

            className:
                "good",

            icon:
                "fa-seedling"

        };

    }


    if (status === "DRY") {

        return {

            text:
                "حالة الرطوبة: منخفضة",

            className:
                "warning",

            icon:
                "fa-triangle-exclamation"

        };

    }


    if (status === "VERY_WET") {

        return {

            text:
                "حالة الرطوبة: مرتفعة",

            className:
                "warning",

            icon:
                "fa-droplet"

        };

    }


    return {

        text:
            "حالة الرطوبة: غير محددة",

        className:
            "warning",

        icon:
            "fa-circle-question"

    };

}


// LOAD SCAN HISTORY
async function loadScanHistory() {

    try {

        // AUTH
        const authHeaders =
            getAuthHeaders();

        if (!authHeaders) {

            return;

        }


        // GET SCANS
        const response =
            await fetch(
                `${SCAN_HISTORY_API_URL}/scans`,
                {
                    method:
                        "GET",

                    headers:
                        authHeaders
                }
            );


        // HANDLE AUTH ERRORS
        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "agriscan_token"
                );

                window.location.href =
                    "login.html";

                return;

            }

            throw new Error(
                "Failed to load scan history"
            );

        }


        // RESPONSE DATA
        const scans =
            await response.json();


        // TOTAL SCANS
        if (totalScans) {

            totalScans.textContent =
                scans.length;

        }


        // GOOD SCANS
        const goodCount =
            scans.filter(
                function(scan) {

                    return (
                        scan.status ===
                        "NORMAL"
                    );

                }
            ).length;


        if (goodScans) {

            goodScans.textContent =
                goodCount;

        }


        // CLEAR LOADING CONTENT
        if (historyContent) {

            historyContent.innerHTML =
                "";

        }


        // EMPTY HISTORY
        if (
            !Array.isArray(scans) ||
            scans.length === 0
        ) {

            if (historyContent) {

                historyContent.innerHTML = `

                    <div class="history-empty-state">

                        <i class="fa-solid fa-flask"></i>

                        <p>
                            لا توجد فحوصات مسجلة حتى الآن.
                        </p>

                    </div>

                `;

            }

            return;

        }


        // HISTORY SECTION
        const section =
            document.createElement(
                "div"
            );

        section.className =
            "history-section";


        // SECTION TITLE
        const title =
            document.createElement(
                "div"
            );

        title.className =
            "history-section-title";


        title.innerHTML = `

            <span>
                نتائج الفحوصات
            </span>

            <i class="fa-regular fa-calendar"></i>

        `;


        section.appendChild(
            title
        );


        // CREATE SCAN CARDS
        scans.forEach(
            function(scan) {

                const status =
                    getStatusInfo(
                        scan.status
                    );


                const date =
                    new Date(
                        scan.created_at
                    );


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "history-card";


                card.innerHTML = `

                    <div
                        class="history-card-icon ${status.className}"
                    >

                        <i
                            class="fa-solid ${status.icon}"
                        ></i>

                    </div>


                    <div
                        class="history-card-content"
                    >

                        <h3>
                            ${scan.farm_name || "مزرعة غير محددة"}
                            -
                            فحص #${scan.id}
                        </h3>


                        <span
                            class="history-status ${status.className}-text"
                        >

                            ${status.text}

                        </span>


                        <p>

                            المحصول:
                            ${scan.crop_name || "غير محدد"}

                            •

                            الرطوبة
                            ${scan.moisture ?? "-"}%

                            •

                            درجة الحرارة
                            ${scan.temperature ?? "-"}°C

                        </p>


                        <small>

                            <i
                                class="fa-regular fa-clock"
                            ></i>

                            ${date.toLocaleString("ar-EG")}

                        </small>


                        <small class="history-device">

                            <i
                                class="fa-solid fa-microchip"
                            ></i>

                            الجهاز:
                            ${scan.device_code || "غير مرتبط"}

                        </small>

                    </div>


                    <button
                        class="history-view-btn"
                        type="button"
                        data-scan-id="${scan.id}"
                        data-farm-id="${scan.farm_id}"
                    >

                        <i
                            class="fa-solid fa-chevron-right"
                        ></i>

                    </button>

                `;


                // VIEW ANALYSIS BUTTON
                const viewButton =
                    card.querySelector(
                        ".history-view-btn"
                    );


                if (viewButton) {

                    viewButton.addEventListener(
                        "click",
                        function() {

                            const scanId =
                                this.dataset.scanId;

                            const farmId =
                                this.dataset.farmId;


                            if (
                                scanId &&
                                farmId
                            ) {

                                window.location.href =
                                    `analysis.html?farmId=${farmId}&scanId=${scanId}`;

                            }

                        }
                    );

                }


                // ADD CARD
                section.appendChild(
                    card
                );

            }
        );



        // ADD SECTION TO PAGE
        if (historyContent) {

            historyContent.appendChild(
                section
            );

        }

    }
    catch (error) {

        console.error(
            "Error loading scan history:",
            error
        );


        if (historyContent) {

            historyContent.innerHTML = `

                <div class="history-empty-state">

                    <i
                        class="fa-solid fa-triangle-exclamation"
                    ></i>

                    <p>
                        حدث خطأ أثناء تحميل سجل الفحوصات.
                    </p>

                </div>

            `;

        }

    }

}


// START
loadScanHistory();