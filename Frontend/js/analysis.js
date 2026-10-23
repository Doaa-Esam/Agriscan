
// AGRISCAN - ANALYSIS PAGE
const ANALYSIS_API_URL =
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

// HANDLE AUTH ERROR
function handleAuthError() {

    localStorage.removeItem(
        "agriscan_token"
    );

    localStorage.removeItem(
        "agriscan_user"
    );

    window.location.href =
        "login.html";

}

// GET URL PARAMETERS
const urlParams =
    new URLSearchParams(
        window.location.search
    );


const farmId =
    urlParams.get("farmId");


const scanId =
    urlParams.get("scanId");

// GET PARAMETER EVALUATION
function getParameterEvaluation(
    evaluations,
    parameterId
) {

    if (!Array.isArray(evaluations)) {

        return null;

    }

    return evaluations.find(
        function(parameter) {

            return (
                Number(parameter.id) ===
                Number(parameterId)
            );

        }
    );

}

// GET STATUS TEXT
function getEvaluationStatusText(
    status
) {

    switch (status) {

        case "OPTIMAL":

            return "داخل النطاق الموثق";


        case "BELOW_RANGE":

            return "أقل من النطاق الموثق";


        case "ABOVE_RANGE":

            return "أعلى من النطاق الموثق";


        case "UNKNOWN":

            return "لا يوجد معيار موثق للتقييم";


        default:

            return "التقييم غير متاح";

    }

}

// GET STATUS CLASS
function getEvaluationStatusClass(
    status
) {

    switch (status) {

        case "OPTIMAL":

            return "normal";


        case "BELOW_RANGE":

        case "ABOVE_RANGE":

            return "low";


        case "UNKNOWN":

        default:

            return "";

    }

}

// FORMAT MEASUREMENT
function formatMeasurement(
    value,
    decimals = 2
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "غير متاح";

    }

    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return "غير متاح";

    }

    return number.toFixed(
        decimals
    );

}

// SET PARAMETER STATUS
function setParameterStatus(
    elementId,
    evaluation
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    if (
        !evaluation ||
        evaluation.status === "UNKNOWN"
    ) {

        element.textContent =
            "لا يوجد معيار موثق للتقييم";

        element.className =
            "";

        return;

    }


    element.textContent =
        getEvaluationStatusText(
            evaluation.status
        );


    element.className =
        getEvaluationStatusClass(
            evaluation.status
        );

}

// BUILD EVALUATION SUMMARY
function buildEvaluationSummary(
    evaluations
) {

    if (
        !Array.isArray(evaluations) ||
        evaluations.length === 0
    ) {

        return (
            "لا توجد بيانات تقييم متاحة لهذا الفحص حاليًا."
        );

    }


    const evaluatedParameters =
        evaluations.filter(
            function(parameter) {

                return (
                    parameter.status &&
                    parameter.status !==
                    "UNKNOWN"
                );

            }
        );


    const unknownParameters =
        evaluations.filter(
            function(parameter) {

                return (
                    !parameter.status ||
                    parameter.status ===
                    "UNKNOWN"
                );

            }
        );


    if (
        evaluatedParameters.length === 0
    ) {

        return (
            "لا توجد معايير موثقة متاحة لمقارنة قياسات هذا الفحص حاليًا."
        );

    }


    let summary =
        `تم تقييم ${evaluatedParameters.length} من ${evaluations.length} قياسات وفقًا للمعايير الموثقة المتاحة.`;


    if (
        unknownParameters.length > 0
    ) {

        summary +=
            " باقي القياسات لا يوجد لها معيار موثق للتقييم حاليًا.";

    }


    return summary;

}

// SET OVERALL EVALUATION
function setOverallEvaluation(
    evaluations
) {

    const soilHealth =
        document.getElementById(
            "soilHealth"
        );


    const soilHealthText =
        document.getElementById(
            "soilHealthText"
        );


    const summary =
        buildEvaluationSummary(
            evaluations
        );


    const evaluatedParameters =
        Array.isArray(evaluations)
            ? evaluations.filter(
                function(parameter) {

                    return (
                        parameter.status &&
                        parameter.status !==
                        "UNKNOWN"
                    );

                }
            )
            : [];


    if (soilHealth) {

        if (
            evaluatedParameters.length > 0
        ) {

            soilHealth.textContent =
                "توجد قياسات قابلة للتقييم";

        }

        else {

            soilHealth.textContent =
                "لا يوجد تقييم موثق كافٍ";

        }

    }


    if (soilHealthText) {

        soilHealthText.textContent =
            summary;

    }

}

// SET EVALUATION SUMMARY CARD
function setRecommendationSummary(
    evaluations
) {

    const recommendationText =
        document.getElementById(
            "recommendationText"
        );


    if (!recommendationText) {

        return;

    }


    recommendationText.textContent =
        buildEvaluationSummary(
            evaluations
        );

}

// LOAD ANALYSIS DATA
async function loadAnalysisData() {

    try {

        // AUTH
        const authHeaders =
            getAuthHeaders();


        if (!authHeaders) {

            return;

        }

        // CHECK FARM ID
        if (!farmId) {

            throw new Error(
                "لم يتم تحديد المزرعة."
            );

        }

        // CHECK SCAN ID
        if (!scanId) {

            throw new Error(
                "لم يتم تحديد الفحص المطلوب."
            );

        }

        // GET FARM SCANS
        const scanUrl =
            `${ANALYSIS_API_URL}/scans?farm_id=${farmId}`;


        const scanResponse =
            await fetch(
                scanUrl,
                {
                    headers:
                        authHeaders
                }
            );


        if (
            scanResponse.status === 401 ||
            scanResponse.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!scanResponse.ok) {

            throw new Error(
                "فشل تحميل بيانات التربة."
            );

        }


        const scans =
            await scanResponse.json();


        if (
            !Array.isArray(scans) ||
            scans.length === 0
        ) {

            throw new Error(
                "لا توجد نتائج فحص لهذه المزرعة."
            );

        }

        // GET REQUESTED SCAN
        const scan =
            scans.find(
                function(item) {

                    return (
                        Number(item.id) ===
                        Number(scanId)
                    );

                }
            );


        if (!scan) {

            throw new Error(
                "الفحص المطلوب غير موجود أو لا ينتمي إلى هذه المزرعة."
            );

        }


        console.log(
            "الفحص المحدد:",
            scan
        );

        // GET OVERALL EVALUATION
        const evaluationResponse =
            await fetch(
                `${ANALYSIS_API_URL}/scans/${scan.id}/evaluation`,
                {
                    headers:
                        authHeaders
                }
            );


        if (
            evaluationResponse.status === 401 ||
            evaluationResponse.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!evaluationResponse.ok) {

            throw new Error(
                "فشل تحميل تقييم قياسات التربة."
            );

        }


        const evaluation =
            await evaluationResponse.json();


        console.log(
            "تقييم التربة:",
            evaluation
        );


        const evaluations =
            Array.isArray(
                evaluation.parameters
            )
                ? evaluation.parameters
                : [];


        // GET EACH PARAMETER EVALUATION
        const phEvaluation =
            getParameterEvaluation(
                evaluations,
                1
            );


        const moistureEvaluation =
            getParameterEvaluation(
                evaluations,
                2
            );


        const temperatureEvaluation =
            getParameterEvaluation(
                evaluations,
                3
            );


        const nitrogenEvaluation =
            getParameterEvaluation(
                evaluations,
                4
            );


        const phosphorusEvaluation =
            getParameterEvaluation(
                evaluations,
                5
            );


        const potassiumEvaluation =
            getParameterEvaluation(
                evaluations,
                6
            );


        // pH VALUE
        const phValue =
            document.getElementById(
                "phValue"
            );


        if (phValue) {

            phValue.textContent =
                formatMeasurement(
                    scan.ph,
                    2
                );

        }

        // pH STATUS
        setParameterStatus(
            "phStatus",
            phEvaluation
        );


        // MOISTURE VALUE
        const moistureValue =
            document.getElementById(
                "moistureValue"
            );


        if (moistureValue) {

            if (
                scan.moisture !== null &&
                scan.moisture !== undefined
            ) {

                moistureValue.textContent =
                    `${formatMeasurement(
                        scan.moisture,
                        0
                    )}%`;

            }

            else {

                moistureValue.textContent =
                    "غير متاح";

            }

        }


        // MOISTURE STATUS
        setParameterStatus(
            "moistureStatus",
            moistureEvaluation
        );


        // TEMPERATURE VALUE
        const temperatureValue =
            document.getElementById(
                "temperatureValue"
            );


        if (temperatureValue) {

            if (
                scan.temperature !== null &&
                scan.temperature !== undefined
            ) {

                temperatureValue.textContent =
                    `${formatMeasurement(
                        scan.temperature,
                        2
                    )}°C`;

            }

            else {

                temperatureValue.textContent =
                    "غير متاح";

            }

        }


        // TEMPERATURE STATUS
        setParameterStatus(
            "temperatureStatus",
            temperatureEvaluation
        );


        // 7. NITROGEN VALUE
        const nitrogenValue =
            document.getElementById(
                "nitrogenValue"
            );


        if (nitrogenValue) {

            nitrogenValue.textContent =
                formatMeasurement(
                    scan.nitrogen,
                    2
                );

        }


        // NITROGEN STATUS
        setParameterStatus(
            "nitrogenStatus",
            nitrogenEvaluation
        );


        // PHOSPHORUS VALUE
        const phosphorusValue =
            document.getElementById(
                "phosphorusValue"
            );


        if (phosphorusValue) {

            phosphorusValue.textContent =
                formatMeasurement(
                    scan.phosphorus,
                    2
                );

        }


        // PHOSPHORUS STATUS
        setParameterStatus(
            "phosphorusStatus",
            phosphorusEvaluation
        );


        // POTASSIUM VALUE
        const potassiumValue =
            document.getElementById(
                "potassiumValue"
            );


        if (potassiumValue) {

            potassiumValue.textContent =
                formatMeasurement(
                    scan.potassium,
                    2
                );

        }


        // POTASSIUM STATUS
        setParameterStatus(
            "potassiumStatus",
            potassiumEvaluation
        );


        // OVERALL EVALUATION
        setOverallEvaluation(
            evaluations
        );


        // EVALUATION SUMMARY
        setRecommendationSummary(
            evaluations
        );


        // SCAN DATE
        const scanDate =
            document.getElementById(
                "scanDate"
            );


        if (
            scanDate &&
            scan.created_at
        ) {

            const date =
                new Date(
                    scan.created_at
                );


            scanDate.textContent =
                date.toLocaleString(
                    "ar-EG"
                );

        }

        else if (scanDate) {

            scanDate.textContent =
                "غير متاح";

        }


        // DEVICE
        const deviceCode =
            document.getElementById(
                "deviceCode"
            );


        if (deviceCode) {

            if (scan.device_code) {

                deviceCode.textContent =
                    scan.device_code;

            }

            else {

                deviceCode.textContent =
                    "غير مرتبط";

            }

        }


        // GET FARM
        const farmResponse =
            await fetch(
                `${ANALYSIS_API_URL}/farms/${farmId}`,
                {
                    headers:
                        authHeaders
                }
            );


        if (
            farmResponse.status === 401 ||
            farmResponse.status === 403
        ) {

            handleAuthError();

            return;

        }


        if (!farmResponse.ok) {

            throw new Error(
                "فشل تحميل بيانات المزرعة."
            );

        }


        const farm =
            await farmResponse.json();


        console.log(
            "المزرعة المحددة:",
            farm
        );


        // CROP DATA
        const cropName =
            document.getElementById(
                "cropName"
            );


        const cropDescription =
            document.getElementById(
                "cropDescription"
            );


        const cropImages =
            document.getElementById(
                "cropImages"
            );


        if (cropName) {

            cropName.textContent =
                farm.crop_name ||
                "غير متاح";

        }


        if (cropDescription) {

            cropDescription.textContent =
                "جاري تحميل بيانات المحصول...";

        }


        if (cropImages) {

            cropImages.innerHTML =
                "";

        }


        // GET CROP DETAILS
        if (farm.crop_id) {

            const cropResponse =
                await fetch(
                    `${ANALYSIS_API_URL}/crops/${farm.crop_id}/details`,
                    {
                        headers:
                            authHeaders
                    }
                );


            if (
                cropResponse.status === 401 ||
                cropResponse.status === 403
            ) {

                handleAuthError();

                return;

            }

if (!cropResponse.ok) {

                throw new Error(
                    "فشل تحميل بيانات المحصول."
                );

            }


            const cropData =
                await cropResponse.json();


            console.log(
                "بيانات المحصول:",
                cropData
            );

            // CROP NAME
            if (cropName) {

                cropName.textContent =
                    cropData.crop?.name ||
                    farm.crop_name ||
                    "غير متاح";

            }


            // CROP DESCRIPTION
            if (cropDescription) {

                cropDescription.textContent =
                    cropData.crop?.description ||
                    "لا توجد بيانات وصفية متاحة للمحصول حاليًا.";

            }

            // CROP IMAGES
            if (
                cropImages &&
                Array.isArray(
                    cropData.images
                )
            ) {

                cropData.images.forEach(
                    function(image) {

                        if (!image.image_path) {
                        return;

                        }


                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                          `https://accelerator-standard-giraffe.abasthan.app${image.image_path}`;

                        img.alt =
                            cropData.crop?.name ||
                            "صورة المحصول";


                        cropImages.appendChild(
                            img
                        );

                    }
                );

            }

        }

        else {

            if (cropDescription) {

                cropDescription.textContent=
                    "لا يوجد محصول مرتبط بهذه المزرعة.";

            }

        }

        // DIAGNOSIS
        const diseaseName =
            document.getElementById(
                "diseaseName"
            );

            const diseaseSymptoms =
            document.getElementById(
                "diseaseSymptoms"
            );


        const diseaseTreatment =
            document.getElementById(
                "diseaseTreatment"
            );


        const diseaseImages =
            document.getElementById(
                "diseaseImages"
            );
           if (diseaseName) {

            diseaseName.textContent =
                "لم يتم إجراء تشخيص مرضي";

        }


        if (diseaseSymptoms) {

            diseaseSymptoms.textContent =
                "نتيجة هذا الفحص تعتمد على قياسات التربة فقط، ولا توجد نتيجة تشخيص مرضي مرتبطة بهذا الفحص حاليًا.";

        }
            if (diseaseTreatment) {
            diseaseTreatment.textContent =
                "لا توجد توصية علاجية؛ لأن تشخيص المرض لم يتم إجراؤه لهذا الفحص.";

        }

        if (diseaseImages) {

            diseaseImages.innerHTML =
                "";

        }
        // SUCCESS

        console.log(
            "تم تحميل التحليل بنجاح."
        );


        console.log(
            "معرف المزرعة:",
            farmId
        );


        console.log(
            "معرف الفحص:",
            scanId
        );

    }

    catch (error) {

        console.error(
            "حدث خطأ في تحميل بيانات التحليل:",
            error
        );


        const soilHealth =
            document.getElementById(
                "soilHealth"
            );


        const soilHealthText =
            document.getElementById(
                "soilHealthText"
            );


        if (soilHealth) {

            soilHealth.textContent =
                "تعذر تحميل التقييم";

        }


        if (soilHealthText) {

            soilHealthText.textContent =
                error.message ||
                "حدث خطأ أثناء تحميل بيانات الفحص.";

        }

    }

}

// START
loadAnalysisData();

// BACK TO SOIL SCAN
const backToScan =
    document.getElementById(
        "backToScan"
    );


if (backToScan) {

    backToScan.addEventListener(
        "click",
        function() {

            if (farmId) {

                window.location.href =
                    `soil-scan.html?farmId=${farmId}`;

            }

            else {
              window.location.href =
              "soil-scan.html";

            }

        }
    );

}


// VIEW CROP DETAILS
const viewCropDetails =
    document.getElementById(
        "viewCropDetails"
    );


if (viewCropDetails) {

    viewCropDetails.addEventListener(
        "click",
        function() {

            if (farmId) {
                window.location.href =
                `crop-details.html?farmId=${farmId}`;

            }

            else {

                window.location.href =
                    "crop-details.html";

            }

        }
    );

}

// SAVE RESULT
const saveResultBtn =
    document.getElementById(
        "saveResultBtn"
    );

if (saveResultBtn) {

    saveResultBtn.addEventListener(
        "click",
        function() {

            saveResultBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> النتيجة محفوظة في سجل الفحوصات';

            saveResultBtn.disabled =
                true;

        }
    );

}