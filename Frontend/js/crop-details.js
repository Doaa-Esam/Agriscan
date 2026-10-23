// API
const CROP_DETAILS_API =
    "https://accelerator-standard-giraffe.abasthan.app/api";

// GET ELEMENTS
const cropGrid =
    document.getElementById("cropGrid");

const backToAnalysisBtn =
    document.getElementById("backToAnalysis");

const newScanButton =
    document.getElementById("newScanBtn");

const soilStatus =
    document.getElementById("soilStatus");

const soilSummaryText =
    document.getElementById("soilSummaryText");

const cropAdviceText =
    document.getElementById("cropAdviceText");


// GET URL PARAMETERS
const urlParams =
    new URLSearchParams(
        window.location.search
    );


const farmId =
    urlParams.get("farmId");


const scanId =
    urlParams.get("scanId");


console.log(
    "Farm ID:",
    farmId
);


console.log(
    "Scan ID:",
    scanId
);


// AUTH TOKEN
function getCropDetailsToken() {

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


// AUTH HEADERS
function getAuthHeaders() {

    const token =
        getCropDetailsToken();


    if (!token) {

        return null;

    }


    return {

        "Authorization":
            `Bearer ${token}`

    };

}


// HANDLE AUTH ERROR
function handleCropDetailsAuthError(
    response
) {

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


        return true;

    }


    return false;

}

// LOAD CROPS
async function loadCrops() {

    if (!cropGrid) {

        return;

    }


    const headers =
        getAuthHeaders();


    if (!headers) {

        return;

    }


    try {

        let crops = [];

        // FARM ID EXISTS
        // LOAD FARM CROP
        if (farmId) {

            const farmResponse =
                await fetch(
                    `${CROP_DETAILS_API}/farms/${farmId}`,
                    {
                        method: "GET",
                        headers: headers
                    }
                );


            if (
                handleCropDetailsAuthError(
                    farmResponse
                )
            ) {

                return;

            }


            if (!farmResponse.ok) {

                throw new Error(
                    "فشل تحميل بيانات المزرعة"
                );

            }


            const farm =
                await farmResponse.json();


            console.log(
                "المزرعة المحددة:",
                farm
            );


            if (!farm.crop_id) {

                cropGrid.innerHTML = `
                    <p>
                        لم يتم تحديد محصول لهذه المزرعة.
                    </p>
                `;

                return;

            }


            // LOAD CROP DETAILS
            const cropResponse =
                await fetch(
                    `${CROP_DETAILS_API}/crops/${farm.crop_id}`,
                    {
                        method: "GET"
                    }
                );


            if (!cropResponse.ok) {

                throw new Error(
                    "فشل تحميل بيانات المحصول"
                );

            }


            const crop =
                await cropResponse.json();


            console.log(
                "المحصول المحدد:",
                crop
            );


            crops = [crop];

        }

        // NO FARM ID
        // LOAD ALL CROPS
        else {

            const response =
                await fetch(
                    `${CROP_DETAILS_API}/crops`,
                    {
                        method: "GET"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "فشل تحميل المحاصيل"
                );

            }


            crops =
                await response.json();

        }


        console.log(
            "المحاصيل:",
            crops
        );


        cropGrid.innerHTML = "";


        if (
            !Array.isArray(crops) ||
            crops.length === 0
        ) {

            cropGrid.innerHTML = `
                <p>
                    لا توجد محاصيل متاحة حاليًا.
                </p>
            `;

            return;

        }

        // CREATE CROP CARDS
        crops.forEach(
            function(crop) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "crop-card";


                card.innerHTML = `

                    <div class="crop-card-icon">
                        <i class="fa-solid fa-seedling"></i>
                    </div>

                    <div class="crop-card-content">

                        <h3>
                            ${crop.name || "محصول"}
                        </h3>

                        <span class="crop-match">
                            ${
                                farmId
                                    ? "محصول المزرعة"
                                    : "محصول مسجل"
                            }
                        </span>

                        <p>
                            ${
                                crop.description ||
                                "لا توجد تفاصيل متاحة حاليًا."
                            }
                        </p>

                    </div>

                    <button
                        class="crop-details-btn"
                        type="button"
                        data-id="${crop.id}">

                        <i class="fa-solid fa-chevron-left"></i>

                    </button>
                `;


                cropGrid.appendChild(
                    card
                );

            }
        );

        // DETAILS BUTTONS
        const buttons =
            cropGrid.querySelectorAll(
                ".crop-details-btn"
            );


        buttons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const selectedCropId =
                            this.dataset.id;


                        if (!selectedCropId) {

                            console.error(
                                "رقم المحصول غير موجود"
                            );

                            return;

                        }


                        if (farmId) {

                            window.location.href =
                                `crop-details-view.html?id=${selectedCropId}&farmId=${farmId}`;

                        }

                        else {

                            window.location.href =
                                `crop-details-view.html?id=${selectedCropId}`;

                        }

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "خطأ في تحميل المحاصيل:",
            error
        );


        cropGrid.innerHTML = `
            <p>
                حدث خطأ أثناء تحميل المحاصيل.
            </p>
        `;

    }

}


// LOAD SOIL SUMMARY
async function loadSoilSummary() {

    const headers =
        getAuthHeaders();


    if (!headers) {

        return;

    }


    try {

        let url =
            `${CROP_DETAILS_API}/scans`;

        // LOAD SCANS FOR SELECTED FARM
        if (farmId) {

            url +=
                `?farm_id=${farmId}`;

        }


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (
            handleCropDetailsAuthError(
                response
            )
        ) {

            return;

        }


        if (!response.ok) {

            throw new Error(
                "فشل تحميل بيانات التربة"
            );

        }


        const scans =
            await response.json();


        console.log(
            "فحوصات المزرعة:",
            scans
        );


        if (
            !Array.isArray(scans) ||
            scans.length === 0
        ) {

            if (soilStatus) {

                soilStatus.textContent =
                    "لا توجد بيانات";

            }


            if (soilSummaryText) {

                soilSummaryText.textContent =
                    "لم يتم إجراء فحص للتربة بعد.";

            }


            return;

        }

        // GET LATEST SCAN
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
            "آخر فحص:",
            latestScan
        );


        if (!latestScan) {

            return;

        }

        // LOAD REAL EVALUATION
        let evaluation =
            null;


        const evaluationResponse =
            await fetch(
                `${CROP_DETAILS_API}/scans/${latestScan.id}/evaluation`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (
            handleCropDetailsAuthError(
                evaluationResponse
            )
        ) {

            return;

        }


        if (evaluationResponse.ok) {

            evaluation =
                await evaluationResponse.json();


            console.log(
                "تقييم التربة:",
                evaluation
            );

        }


        // SOIL STATUS
        if (soilStatus) {

            if (
                evaluation &&
                Array.isArray(
                    evaluation.parameters
                )
            ) {

                const evaluatedParameters =
                    evaluation.parameters.filter(
                        function(parameter) {

                            return (
                                parameter.status !==
                                "UNKNOWN"
                            );

                        }
                    );


                if (
                    evaluatedParameters.length > 0
                ) {

                    soilStatus.textContent =
                        "توجد قياسات قابلة للتقييم";

                }

                else {

                    soilStatus.textContent =
                        "في انتظار معايير التقييم";

                }

            }

            else {

                soilStatus.textContent =
                    "في انتظار التقييم";

            }

        }


        // SOIL SUMMARY
        if (soilSummaryText) {

            const moisture =
                latestScan.moisture !== null &&
                latestScan.moisture !== undefined
                    ? `${latestScan.moisture}%`
                    : "غير متاحة";


            const temperature =
                latestScan.temperature !== null &&
                latestScan.temperature !== undefined
                    ? `${latestScan.temperature}°C`
                    : "غير متاحة";


            soilSummaryText.textContent =
                `الرطوبة ${moisture} • درجة الحرارة ${temperature}`;

        }

    }

    catch (error) {

        console.error(
            "خطأ في تحميل بيانات التربة:",
            error
        );


        if (soilStatus) {

            soilStatus.textContent =
                "تعذر التحميل";

        }


        if (soilSummaryText) {

            soilSummaryText.textContent =
                "تعذر تحميل بيانات فحص التربة.";

        }

    }

}

// LOAD CROP ADVICE
async function loadCropAdvice() {

    if (!cropAdviceText) {

        return;

    }


    const headers =
        getAuthHeaders();


    if (!headers) {

        return;

    }


    try {

        let url =
            `${CROP_DETAILS_API}/scans`;


        if (farmId) {

            url +=
                `?farm_id=${farmId}`;

        }


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (
            handleCropDetailsAuthError(
                response
            )
        ) {

            return;

        }


        if (!response.ok) {

            throw new Error(
                "فشل تحميل بيانات التربة"
            );

        }


        const scans =
            await response.json();


        if (
            !Array.isArray(scans) ||
            scans.length === 0
        ) {

            cropAdviceText.textContent =
                "قم بإجراء فحص للتربة أولًا لعرض نتائج مرتبطة بالمحصول.";

            return;

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


        if (!latestScan) {

            cropAdviceText.textContent =
                "لا توجد نتيجة فحص متاحة حاليًا.";

            return;

        }


        // GET EVALUATION
        const evaluationResponse =
            await fetch(
                `${CROP_DETAILS_API}/scans/${latestScan.id}/evaluation`,
                {
                    method: "GET",
                    headers: headers
                }
            );


        if (
            handleCropDetailsAuthError(
                evaluationResponse
            )
        ) {

            return;

        }


        if (!evaluationResponse.ok) {

            cropAdviceText.textContent =
                "لا توجد توصيات موثقة متاحة حاليًا.";

            return;

        }


        const evaluation =
            await evaluationResponse.json();


        console.log(
            "تقييم المحصول:",
            evaluation
        );

        // GET DOCUMENTED EVALUATIONS
        const evaluatedParameters =
            Array.isArray(
                evaluation.parameters
            )
                ? evaluation.parameters.filter(
                    function(parameter) {

                        return (
                            parameter.status !==
                            "UNKNOWN"
                        );

                    }
                )
                : [];


        if (
            evaluatedParameters.length === 0
        ) {

            cropAdviceText.textContent =
                "لا توجد معايير موثقة كافية لتقديم توصية للمحصول حاليًا.";

            return;

        }


        // BUILD FACTUAL SUMMARY
        const summaryParts =
            evaluatedParameters.map(
                function(parameter) {

                    let statusText =
                        "تم تقييم القياس";


                    if (
                        parameter.status ===
                        "OPTIMAL"
                    ) {

                        statusText =
                            "داخل النطاق المناسب";

                    }

                    else if (
                        parameter.status ===
                        "BELOW_RANGE"
                    ) {

                        statusText =
                            "أقل من النطاق المناسب";

                    }

                    else if (
                        parameter.status ===
                        "ABOVE_RANGE"
                    ) {

                        statusText =
                            "أعلى من النطاق المناسب";

                    }


                    return (
                        `${parameter.name}: ${statusText}`
                    );

                }
            );


        cropAdviceText.textContent =
            summaryParts.join(" • ");

    }

    catch (error) {

        console.error(
            "خطأ في تحميل نتائج المحصول:",
            error
        );


        cropAdviceText.textContent =
            "تعذر تحميل نتائج التقييم حاليًا.";

    }

}


// BACK TO ANALYSIS
if (backToAnalysisBtn) {

    backToAnalysisBtn.addEventListener(
        "click",
        function() {

            if (farmId && scanId) {

                window.location.href =
                    `analysis.html?farmId=${farmId}&scanId=${scanId}`;

            }

            else if (farmId) {

                window.location.href =
                    `analysis.html?farmId=${farmId}`;

            }

            else {

                window.location.href =
                    "analysis.html";

            }

        }
    );

}


// NEW SOIL SCAN
if (newScanButton) {

    newScanButton.addEventListener(
        "click",
        function() {

            if (farmId) {

                window.location.href =
                    `connect-device.html?farmId=${farmId}`;

            }

            else {

                window.location.href =
                    "farms.html?action=scan";

            }

        }
    );

}


// START
loadCrops();

loadSoilSummary();

loadCropAdvice();