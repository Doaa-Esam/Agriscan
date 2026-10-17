
// DASHBOARD PAGE
const isDashboardPage =
    window.location.pathname.endsWith(
        "dashboard.html"
    );


if (isDashboardPage) {

    // API
    const dashboardAPI =
        "http://localhost:3000/api";

    // ELEMENTS
    const dashboardSoilStatus =
        document.getElementById(
            "dashboardSoilStatus"
        );


    const dashboardLastScan =
        document.getElementById(
            "dashboardLastScan"
        );


    const dashboardStatusIcon =
        document.getElementById(
            "dashboardStatusIcon"
        );


    const dashboardPh =
        document.getElementById(
            "dashboardPh"
        );


    const dashboardPhStatus =
        document.getElementById(
            "dashboardPhStatus"
        );


    const dashboardMoisture =
        document.getElementById(
            "dashboardMoisture"
        );


    const dashboardMoistureStatus =
        document.getElementById(
            "dashboardMoistureStatus"
        );


    const dashboardNitrogen =
        document.getElementById(
            "dashboardNitrogen"
        );


    const dashboardNitrogenStatus =
        document.getElementById(
            "dashboardNitrogenStatus"
        );


    const dashboardTemperature =
        document.getElementById(
            "dashboardTemperature"
        );


    const dashboardTemperatureStatus =
        document.getElementById(
            "dashboardTemperatureStatus"
        );


    // GET AUTH TOKEN
    function getDashboardToken() {

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


    // HANDLE AUTH ERROR
    function handleDashboardAuthError() {

        localStorage.removeItem(
            "agriscan_token"
        );


        localStorage.removeItem(
            "agriscan_user"
        );


        window.location.href =
            "login.html";

    }


    // FORMAT DATE
    function formatDashboardDate(
        dateValue,
        farmName
    ) {

        if (!dateValue) {

            return "لم يتم إجراء فحص بعد";

        }


        const date =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return farmName
                ? `المزرعة: ${farmName}`
                : "تاريخ الفحص غير متاح";

        }


        const formattedDate =
            date.toLocaleDateString(
                "ar-EG",
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );


        if (farmName) {

            return (
                `آخر فحص: ${formattedDate} - ${farmName}`
            );

        }


        return (
            `آخر فحص: ${formattedDate}`
        );

    }


    // FORMAT VALUE
    function formatDashboardValue(
        value,
        decimals = 2,
        suffix = ""
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "غير متاح";

        }


        const number =
            Number(
                value
            );


        if (
            Number.isNaN(
                number
            )
        ) {

            return "غير متاح";

        }


        return (
            `${number.toFixed(decimals)}${suffix}`
        );

    }


    // GET PARAMETER EVALUATION
    function getDashboardParameterEvaluation(
        evaluations,
        parameterId
    ) {

        if (
            !Array.isArray(
                evaluations
            )
        ) {

            return null;

        }


        return evaluations.find(
            function(parameter) {

                return (
                    Number(
                        parameter.id
                    ) ===
                    Number(
                        parameterId
                    )
                );

            }
        ) || null;

    }


    // GET EVALUATION STATUS TEXT
    function getDashboardEvaluationText(
        evaluation
    ) {

        if (
            !evaluation ||
            evaluation.status === "UNKNOWN"
        ) {

            return "لا يوجد معيار موثق للتقييم";

        }


        switch (
            evaluation.status
        ) {

            case "OPTIMAL":

                return "داخل النطاق الموثق";


            case "BELOW_RANGE":

                return "أقل من النطاق الموثق";


            case "ABOVE_RANGE":

                return "أعلى من النطاق الموثق";


            default:

                return "التقييم غير متاح";

        }

    }

    // GET OVERALL EVALUATION STATUS
    function getDashboardOverallStatus(
        scan,
        evaluations
    ) {

        // NO SCAN
        if (!scan) {

            return {
                text: "لا توجد نتيجة",
                icon: "fa-solid fa-circle-info"
            };

        }


        // PENDING EVALUATION
        if (
            scan.status ===
            "PENDING_EVALUATION"
        ) {

            return {
                text: "في انتظار التقييم",
                icon: "fa-solid fa-clock"
            };

        }


        // EVALUATION DATA
        const validEvaluations =
            Array.isArray(
                evaluations
            )
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


        if (
            validEvaluations.length === 0
        ) {

            return {
                text: "لا يوجد تقييم موثق كافٍ",
                icon: "fa-solid fa-circle-info"
            };

        }


        // OUT OF DOCUMENTED RANGE
        const outOfRange =
            validEvaluations.some(
                function(parameter) {

                    return (
                        parameter.status ===
                        "BELOW_RANGE" ||
                        parameter.status ===
                        "ABOVE_RANGE"
                    );

                }
            );


        if (outOfRange) {

            return {
                text: "توجد قياسات خارج النطاق الموثق",
                icon: "fa-solid fa-triangle-exclamation"
            };

        }


        // SOME PARAMETERS EVALUATED
        return {
            text: "تم تقييم بعض القياسات",
            icon: "fa-solid fa-circle-check"
        };

    }


    // SET MEASUREMENT
    function setDashboardMeasurement(
        valueElement,
        statusElement,
        value,
        decimals,
        suffix,
        evaluation
    ) {

        if (valueElement) {

            valueElement.textContent =
                formatDashboardValue(
                    value,
                    decimals,
                    suffix
                );

        }


        if (statusElement) {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                statusElement.textContent =
                    "غير متاح";

            }

            else {

                statusElement.textContent =
                    getDashboardEvaluationText(
                        evaluation
                    );

            }

        }

    }


    // LOAD DASHBOARD EVALUATION
    async function loadDashboardEvaluation(
        scanId,
        token
    ) {

        try {

            const response =
                await fetch(
                    `${dashboardAPI}/scans/${scanId}/evaluation`,
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

                handleDashboardAuthError();

                return null;

            }


            if (!response.ok) {

                console.error(
                    "فشل تحميل تقييم الفحص."
                );


                return null;

            }


            const evaluation =
                await response.json();


            console.log(
                "Dashboard Evaluation:",
                evaluation
            );


            return evaluation;

        }

        catch (error) {

            console.error(
                "خطأ في تحميل تقييم الفحص:",
                error
            );


            return null;

        }

    }

    // LOAD DASHBOARD SCANS
    async function loadDashboardData() {

        const token =
            getDashboardToken();


        if (!token) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${dashboardAPI}/scans`,
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

                handleDashboardAuthError();

                return;

            }


            if (!response.ok) {

                throw new Error(
                    "فشل تحميل بيانات الفحوصات."
                );

            }


            const scans =
                await response.json();


            console.log(
                "Dashboard Scans:",
                scans
            );


            // NO SCANS
            if (
                !Array.isArray(
                    scans
                ) ||
                scans.length === 0
            ) {

                displayDashboardEmptyState();

                return;

            }

            // GET LATEST SCAN
            const latestScan =
                scans.reduce(
                    function(
                        latest,
                        scan
                    ) {

                        if (
                            !latest ||
                            Number(
                                scan.id
                            ) >
                            Number(
                                latest.id
                            )
                        ) {

                            return scan;

                        }


                        return latest;

                    },
                    null
                );


            console.log(
                "Dashboard Latest Scan:",
                latestScan
            );


            // GET REAL EVALUATION
            const evaluation =
                await loadDashboardEvaluation(
                    latestScan.id,
                    token
                );


            const evaluations =
                evaluation &&
                Array.isArray(
                    evaluation.parameters
                )
                    ? evaluation.parameters
                    : [];


            // DISPLAY
            displayDashboardScan(
                latestScan,
                evaluations
            );

        }

        catch (error) {

            console.error(
                "خطأ في تحميل لوحة التحكم:",
                error
            );


            displayDashboardErrorState();

        }

    }


    // DISPLAY EMPTY DASHBOARD
    function displayDashboardEmptyState() {

        if (dashboardSoilStatus) {

            dashboardSoilStatus.textContent =
                "لا توجد نتيجة";

        }


        if (dashboardLastScan) {

            dashboardLastScan.textContent =
                "لم يتم إجراء فحص بعد";

        }


        if (dashboardStatusIcon) {

            dashboardStatusIcon.className =
                "fa-solid fa-circle-info";

        }


        if (dashboardPh) {

            dashboardPh.textContent =
                "غير متاح";

        }


        if (dashboardPhStatus) {

            dashboardPhStatus.textContent =
                "لا توجد قراءة";

        }


        if (dashboardMoisture) {

            dashboardMoisture.textContent =
                "غير متاح";

        }


        if (dashboardMoistureStatus) {

            dashboardMoistureStatus.textContent =
                "لا توجد قراءة";

        }


        if (dashboardNitrogen) {

            dashboardNitrogen.textContent =
                "غير متاح";

        }


        if (dashboardNitrogenStatus) {

            dashboardNitrogenStatus.textContent =
                "لا توجد قراءة";

        }


        if (dashboardTemperature) {

            dashboardTemperature.textContent =
                "غير متاح";

        }


        if (dashboardTemperatureStatus) {

            dashboardTemperatureStatus.textContent =
                "لا توجد قراءة";

        }

    }


    // DISPLAY ERROR DASHBOARD
    function displayDashboardErrorState() {

        if (dashboardSoilStatus) {

            dashboardSoilStatus.textContent =
                "تعذر تحميل البيانات";

        }


        if (dashboardLastScan) {

            dashboardLastScan.textContent =
                "حدث خطأ أثناء تحميل آخر فحص";

        }


        if (dashboardStatusIcon) {

            dashboardStatusIcon.className =
                "fa-solid fa-triangle-exclamation";

        }

    }

    // DISPLAY REAL SCAN
    function displayDashboardScan(
        scan,
        evaluations
    ) {

        if (!scan) {

            displayDashboardEmptyState();

            return;

        }

        // OVERALL STATUS
        const overallStatus =
            getDashboardOverallStatus(
                scan,
                evaluations
            );


        if (dashboardSoilStatus) {

            dashboardSoilStatus.textContent =
                overallStatus.text;

        }


        if (dashboardStatusIcon) {

            dashboardStatusIcon.className =
                overallStatus.icon;

        }


        // FARM + DATE
        if (dashboardLastScan) {

            dashboardLastScan.textContent =
                formatDashboardDate(
                    scan.created_at,
                    scan.farm_name
                );

        }

        // PARAMETERS
        const phEvaluation =
            getDashboardParameterEvaluation(
                evaluations,
                1
            );


        const moistureEvaluation =
            getDashboardParameterEvaluation(
                evaluations,
                2
            );


        const temperatureEvaluation =
            getDashboardParameterEvaluation(
                evaluations,
                3
            );


        const nitrogenEvaluation =
            getDashboardParameterEvaluation(
                evaluations,
                4
            );


        // pH
        setDashboardMeasurement(
            dashboardPh,
            dashboardPhStatus,
            scan.ph,
            2,
            "",
            phEvaluation
        );


        // MOISTURE
        setDashboardMeasurement(
            dashboardMoisture,
            dashboardMoistureStatus,
            scan.moisture,
            0,
            "%",
            moistureEvaluation
        );


        // NITROGEN
        setDashboardMeasurement(
            dashboardNitrogen,
            dashboardNitrogenStatus,
            scan.nitrogen,
            2,
            "",
            nitrogenEvaluation
        );


        // TEMPERATURE
        setDashboardMeasurement(
            dashboardTemperature,
            dashboardTemperatureStatus,
            scan.temperature,
            2,
            "°C",
            temperatureEvaluation
        );

    }

    // START DASHBOARD
    loadDashboardData();

}