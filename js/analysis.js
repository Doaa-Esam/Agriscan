

async function loadAnalysisData() {

    try {

        // 1. GET LATEST SOIL SCAN

        const scanResponse = await fetch(
            "http://localhost:3000/api/scans"
        );

        if (!scanResponse.ok) {
            throw new Error("فشل تحميل بيانات التربة");
        }

        const scans = await scanResponse.json();

        if (scans.length > 0) {

            const scan = scans[0];

            // MOISTURE

            const moistureValue =
                document.getElementById("moistureValue");

            const moistureStatus =
                document.getElementById("moistureStatus");

            if (moistureValue) {
                moistureValue.textContent =
                    `${scan.moisture}%`;
            }


            // TEMPERATURE

            const temperatureValue =
                document.getElementById("temperatureValue");

            const temperatureStatus =
                document.getElementById("temperatureStatus");

            if (temperatureValue) {
                temperatureValue.textContent =
                    `${scan.temperature}°C`;
            }

            // SOIL STATUS

            const healthScore =
                document.getElementById("healthScore");

            const soilHealth =
                document.getElementById("soilHealth");

            const soilHealthText =
                document.getElementById("soilHealthText");


            if (scan.status === "NORMAL") {

                if (healthScore) {
                    healthScore.textContent = "82%";
                }

                if (soilHealth) {
                    soilHealth.textContent = "جيدة";
                }

                if (soilHealthText) {
                    soilHealthText.textContent =
                        "تربتك مناسبة للزراعة.";
                }

                if (moistureStatus) {
                    moistureStatus.textContent = "جيدة";
                    moistureStatus.className = "normal";
                }

                if (temperatureStatus) {
                    temperatureStatus.textContent = "طبيعية";
                    temperatureStatus.className = "normal";
                }

            }

            else if (scan.status === "DRY") {

                if (healthScore) {
                    healthScore.textContent = "55%";
                }

                if (soilHealth) {
                    soilHealth.textContent =
                        "تحتاج إلى متابعة";
                }

                if (soilHealthText) {
                    soilHealthText.textContent =
                        "التربة جافة وتحتاج إلى الاهتمام بالرطوبة.";
                }

                if (moistureStatus) {
                    moistureStatus.textContent = "منخفضة";
                    moistureStatus.className = "low";
                }

                if (temperatureStatus) {
                    temperatureStatus.textContent = "تم القياس";
                    temperatureStatus.className = "normal";
                }

            }

            else if (scan.status === "VERY_WET") {

                if (healthScore) {
                    healthScore.textContent = "60%";
                }

                if (soilHealth) {
                    soilHealth.textContent =
                        "رطبة جدًا";
                }

                if (soilHealthText) {
                    soilHealthText.textContent =
                        "التربة تحتوي على نسبة رطوبة مرتفعة.";
                }

                if (moistureStatus) {
                    moistureStatus.textContent = "مرتفعة";
                    moistureStatus.className = "low";
                }

                if (temperatureStatus) {
                    temperatureStatus.textContent = "تم القياس";
                    temperatureStatus.className = "normal";
                }

            }

            // RECOMMENDATION

            const recommendationText =
                document.getElementById("recommendationText");

            if (recommendationText) {

                if (scan.recommendation) {

                    const recommendation =
                        scan.recommendation.toLowerCase();

                    if (
                        recommendation ===
                        "soil condition looks normal"
                    ) {

                        recommendationText.textContent =
                            "حالة التربة جيدة بشكل عام.";

                    }

                    else {

                        recommendationText.textContent =
                            scan.recommendation;

                    }

                }

                else {

                    recommendationText.textContent =
                        "حالة التربة جيدة بشكل عام.";

                }

            }

            // SCAN DATE

            const scanDate =
                document.getElementById("scanDate");

            if (scanDate && scan.created_at) {

                const date =
                    new Date(scan.created_at);

                scanDate.textContent =
                    date.toLocaleString("ar-EG");

            }

        }


        // 2. REAL DIAGNOSIS

        const diagnosisResponse = await fetch(
            "http://localhost:3000/api/diagnosis",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    // الطماطم
                    crop_id: 1,

                    // اللفحة المبكرة
                    disease_id: 1

                })
            }
        );


        if (!diagnosisResponse.ok) {

            const errorData =
                await diagnosisResponse.json();

            console.error(
                "Diagnosis API Error:",
                errorData
            );

            throw new Error(
                "فشل تحميل بيانات التشخيص"
            );

        }


        const data =
            await diagnosisResponse.json();


        console.log(
            "DIAGNOSIS RESULT:",
            data
        );

        // 3. CROP

        const crop =
            data.crop;

        if (crop) {

            const cropName =
                document.getElementById("cropName");

            const cropDescription =
                document.getElementById("cropDescription");


            if (cropName) {

                cropName.textContent =
                    crop.name;

            }


            if (cropDescription) {

                cropDescription.textContent =
                    crop.description;

            }

            // CROP IMAGES
            const cropImages =
                document.getElementById("cropImages");


            if (cropImages) {

                cropImages.innerHTML = "";


                if (
                    crop.images &&
                    crop.images.length > 0
                ) {

                    crop.images.forEach(function(image) {

                        const img =
                            document.createElement("img");


                        img.src =
                            "http://localhost:3000" +
                            image.image_path;


                        img.alt =
                            crop.name;


                        img.style.width = "120px";
                        img.style.height = "120px";
                        img.style.objectFit = "cover";
                        img.style.borderRadius = "15px";


                        cropImages.appendChild(img);

                    });

                }

            }

        }


        // 4. DIAGNOSIS

        const diagnosis =
            data.diagnosis;


        if (diagnosis) {

            // DISEASE NAME

            const diseaseName =
                document.getElementById("diseaseName");


            if (diseaseName) {

                diseaseName.textContent =
                    diagnosis.disease_name;

            }

            // SYMPTOMS

            const diseaseSymptoms =
                document.getElementById("diseaseSymptoms");


            if (diseaseSymptoms) {

                diseaseSymptoms.textContent =
                    diagnosis.symptoms;

            }

            // TREATMENT

            const diseaseTreatment =
                document.getElementById("diseaseTreatment");


            if (diseaseTreatment) {

                if (
                    diagnosis.treatments &&
                    diagnosis.treatments.length > 0
                ) {

                    const treatments =
                        diagnosis.treatments;


                    diseaseTreatment.textContent =
                        "العلاج: " +
                        treatments
                            .map(item => item.treatment)
                            .join("، ");

                }

                else {

                    diseaseTreatment.textContent =
                        "العلاج: لا توجد توصيات علاجية متاحة.";

                }

            }


            // DISEASE IMAGES

            const diseaseImages =
                document.getElementById("diseaseImages");


            if (diseaseImages) {

                diseaseImages.innerHTML = "";


                if (
                    diagnosis.images &&
                    diagnosis.images.length > 0
                ) {

                    diagnosis.images.forEach(function(image) {

                        const img =
                            document.createElement("img");


                        img.src =
                            "http://localhost:3000" +
                            image.image_path;


                        img.alt =
                            diagnosis.disease_name;


                        img.style.width = "120px";
                        img.style.height = "120px";
                        img.style.objectFit = "cover";
                        img.style.borderRadius = "15px";


                        diseaseImages.appendChild(img);

                    });

                }

            }

        }


    }

    catch (error) {

        console.error(
            "حدث خطأ في تحميل بيانات التحليل:",
            error
        );

    }

}

// START ANALYSIS

loadAnalysisData();

// BACK TO SOIL SCAN

const backToScan =
    document.getElementById("backToScan");


if (backToScan) {

    backToScan.addEventListener(
        "click",
        function() {

            window.location.href =
                "soil-scan.html";

        }
    );

}

// VIEW CROP DETAILS

const viewCropDetails =
    document.getElementById("viewCropDetails");


if (viewCropDetails) {

    viewCropDetails.addEventListener(
        "click",
        function() {

            window.location.href =
                "crop-details.html";

        }
    );

}

// SAVE RESULT

const saveResultBtn =
    document.getElementById("saveResultBtn");


if (saveResultBtn) {

    saveResultBtn.addEventListener(
        "click",
        function() {

            saveResultBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> تم حفظ النتيجة';

        }
    );

}