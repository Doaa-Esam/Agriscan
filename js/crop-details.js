
// ELEMENTS

const cropGrid = document.getElementById("cropGrid");

const backToAnalysisBtn =
    document.getElementById("backToAnalysis");

const newScanButton =
    document.getElementById("newScanBtn");


// LOAD CROPS

async function loadCrops() {

    if (!cropGrid) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:3000/api/crops"
        );

        if (!response.ok) {
            throw new Error("فشل تحميل المحاصيل");
        }

        const crops = await response.json();

        console.log("CROPS:", crops);

        cropGrid.innerHTML = "";

        if (!Array.isArray(crops) || crops.length === 0) {

            cropGrid.innerHTML = `
                <p>
                    لا توجد محاصيل متاحة حاليًا.
                </p>
            `;

            return;
        }


        // CREATE CROP CARDS

        crops.forEach(function(crop) {

            const card =
                document.createElement("div");

            card.className = "crop-card";

            card.innerHTML = `

                <div class="crop-card-icon">
                    <i class="fa-solid fa-seedling"></i>
                </div>

                <div class="crop-card-content">

                    <h3>
                        ${crop.name || "محصول"}
                    </h3>

                    <span class="crop-match">
                        محصول مسجل
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

            cropGrid.appendChild(card);

        });


        // DETAILS BUTTONS

        const buttons =
            cropGrid.querySelectorAll(
                ".crop-details-btn"
            );

        buttons.forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const cropId =
                        this.dataset.id;

                    if (!cropId) {
                        console.error(
                            "رقم المحصول غير موجود"
                        );
                        return;
                    }

                    window.location.href =
                        `crop-details-view.html?id=${cropId}`;

                }
            );

        });

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

    const soilStatus =
        document.getElementById("soilStatus");

    const soilSummaryText =
        document.getElementById("soilSummaryText");

    try {

        const response = await fetch(
            "http://localhost:3000/api/scans"
        );

        if (!response.ok) {
            throw new Error(
                "فشل تحميل بيانات التربة"
            );
        }

        const scans = await response.json();

        console.log("LATEST SCANS:", scans);


        // NO DATA

        if (!Array.isArray(scans) || scans.length === 0) {

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


        // LATEST SCAN

        const scan = scans[0];


        // SOIL STATUS

        if (soilStatus) {

            switch (scan.status) {

                case "NORMAL":

                    soilStatus.textContent =
                        "جيدة";

                    break;

                case "DRY":

                    soilStatus.textContent =
                        "تحتاج إلى متابعة";

                    break;

                case "VERY_WET":

                    soilStatus.textContent =
                        "رطبة جدًا";

                    break;

                default:

                    soilStatus.textContent =
                        "غير محددة";
            }

        }


        // SOIL SUMMARY

        if (soilSummaryText) {

            const moisture =
                scan.moisture !== null &&
                scan.moisture !== undefined
                    ? `${scan.moisture}%`
                    : "غير متاحة";

            const temperature =
                scan.temperature !== null &&
                scan.temperature !== undefined
                    ? `${scan.temperature}°C`
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


// BACK TO ANALYSIS

if (backToAnalysisBtn) {

    backToAnalysisBtn.addEventListener(
        "click",
        function() {

            window.location.href =
                "analysis.html";

        }
    );

}


// NEW SOIL SCAN

if (newScanButton) {

    newScanButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "connect-device.html";

        }
    );

}

// LOAD CROP ADVICE

function loadCropAdvice() {

    const cropAdviceText =
        document.getElementById("cropAdviceText");

    if (!cropAdviceText) {
        return;
    }

    fetch("http://localhost:3000/api/scans")
        .then(function(response) {

            if (!response.ok) {
                throw new Error("فشل تحميل بيانات التربة");
            }

            return response.json();

        })
        .then(function(scans) {

            if (!scans || scans.length === 0) {

                cropAdviceText.textContent =
                    "قم بإجراء فحص للتربة أولًا للحصول على توصيات مناسبة.";

                return;
            }

            const scan = scans[0];

            // التوصية حسب حالة التربة

            if (scan.status === "DRY") {

                cropAdviceText.textContent =
                    "التربة جافة، لذلك يُفضل الاهتمام بمستوى الرطوبة قبل اختيار المحصول المناسب.";

            }

            else if (scan.status === "VERY_WET") {

                cropAdviceText.textContent =
                    "مستوى رطوبة التربة مرتفع، لذلك يُفضل تحسين تصريف المياه قبل الزراعة.";

            }

            else if (scan.status === "NORMAL") {

                cropAdviceText.textContent =
                    "حالة التربة جيدة بشكل عام، ويمكن اختيار المحاصيل المناسبة بناءً على خصائص التربة واحتياجات كل محصول.";

            }

            else {

                cropAdviceText.textContent =
                    "تم تحليل التربة. راجع بيانات الفحص لاختيار المحاصيل المناسبة.";

            }

        })
        .catch(function(error) {

            console.error(
                "خطأ في تحميل توصيات المحاصيل:",
                error
            );

            cropAdviceText.textContent =
                "تعذر تحميل التوصيات حاليًا.";

        });

}

// START

loadCrops();
loadSoilSummary();
loadCropAdvice();
