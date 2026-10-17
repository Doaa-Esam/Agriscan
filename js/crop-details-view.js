
// GET ELEMENTS
const cropNameElement =
    document.getElementById("cropName");

const cropDescriptionElement =
    document.getElementById("cropDescription");

const cropImagesContainer =
    document.getElementById("cropImages");

const diseasesContainer =
    document.getElementById("diseasesContainer");

const backToCrops =
    document.getElementById("backToCrops");

const newScanBtn =
    document.getElementById("newScanBtn");


// GET URL PARAMETERS
const urlParams =
    new URLSearchParams(
        window.location.search
    );


const cropId =
    urlParams.get("id");


const farmId =
    urlParams.get("farmId");


console.log(
    "Crop ID:",
    cropId
);


console.log(
    "Farm ID:",
    farmId
);


// API
const cropDetailsAPI =
    "http://localhost:3000/api";


// AUTH TOKEN
function getCropDetailsToken() {

    return localStorage.getItem(
        "agriscan_token"
    );

}


// AUTH HEADERS
function getCropDetailsHeaders() {

    const token =
        getCropDetailsToken();


    const headers = {};


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    return headers;

}


// HANDLE AUTH ERROR
function handleCropDetailsAuthError() {

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

}

// LOAD CROP DETAILS
async function loadCropDetails() {

    if (!cropId) {

        console.error(
            "Crop ID is missing"
        );


        if (cropNameElement) {

            cropNameElement.textContent =
                "لم يتم تحديد المحصول";

        }


        if (cropDescriptionElement) {

            cropDescriptionElement.textContent =
                "لم يتم تحديد رقم المحصول.";

        }


        return;

    }


    const token =
        getCropDetailsToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        // GET CROP DETAILS
        const response =
            await fetch(
                `${cropDetailsAPI}/crops/${cropId}/details`,
                {
                    method: "GET",

                    headers:
                        getCropDetailsHeaders()
                }
            );


        // AUTH ERROR
        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleCropDetailsAuthError();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "فشل تحميل تفاصيل المحصول"
            );

        }


        const data =
            await response.json();


        console.log(
            "بيانات المحصول:",
            data
        );

        // CROP
        const crop =
            data.crop;


        if (!crop) {

            throw new Error(
                "بيانات المحصول غير موجودة"
            );

        }


        // CROP NAME
        if (cropNameElement) {

            cropNameElement.textContent =
                crop.name ||
                "اسم غير متاح";

        }

        // CROP DESCRIPTION
        if (cropDescriptionElement) {

            cropDescriptionElement.textContent =
                crop.description ||
                "لا توجد تفاصيل متاحة عن هذا المحصول.";

        }

        // CROP IMAGES
        if (cropImagesContainer) {

            cropImagesContainer.innerHTML = "";


            if (
                Array.isArray(data.images) &&
                data.images.length > 0
            ) {

                data.images.forEach(
                    function(image) {

                        const img =
                            document.createElement(
                                "img"
                            );


                        img.src =
                            `${cropDetailsAPI.replace(
                                "/api",
                                ""
                            )}${image.image_path}`;


                        img.alt =
                            crop.name ||
                            "صورة المحصول";


                        img.style.width =
                            "150px";


                        img.style.height =
                            "150px";


                        img.style.objectFit =
                            "cover";


                        img.style.borderRadius =
                            "15px";


                        cropImagesContainer.appendChild(
                            img
                        );

                    }
                );

            }

            else {

                cropImagesContainer.innerHTML = `
                    <p>
                        لا توجد صور متاحة لهذا المحصول.
                    </p>
                `;

            }

        }

        // DISEASES
        if (diseasesContainer) {

            diseasesContainer.innerHTML = "";


            if (
                Array.isArray(data.diseases) &&
                data.diseases.length > 0
            ) {

                data.diseases.forEach(
                    function(disease) {

                        const diseaseCard =
                            document.createElement(
                                "div"
                            );


                        diseaseCard.className =
                            "issue-card";


                        diseaseCard.innerHTML = `

                            <div class="issue-icon warning">

                                <i class="fa-solid fa-virus"></i>

                            </div>


                            <div class="issue-content">

                                <h3>
                                    ${
                                        disease.name ||
                                        "مرض غير معروف"
                                    }
                                </h3>


                                <p>
                                    ${
                                        disease.symptoms ||
                                        "لا توجد أعراض مسجلة."
                                    }
                                </p>


                                <div class="disease-treatments">

                                    ${
                                        Array.isArray(
                                            disease.treatments
                                        ) &&
                                        disease.treatments.length > 0

                                            ?

                                        disease.treatments.map(
                                            function(treatment) {

                                                return `
                                                    <span class="issue-value">
                                                        العلاج:
                                                        ${
                                                            treatment.treatment ||
                                                            "غير متاح"
                                                        }
                                                    </span>
                                                `;

                                            }
                                        ).join("")

                                            :

                                        `
                                            <span class="issue-value">
                                                لا توجد توصيات علاجية متاحة.
                                            </span>
                                        `
                                    }

                                </div>

                            </div>

                        `;


                        diseasesContainer.appendChild(
                            diseaseCard
                        );

                        // DISEASE IMAGES
                        if (
                            Array.isArray(
                                disease.images
                            ) &&
                            disease.images.length > 0
                        ) {

                            const imagesContainer =
                                document.createElement(
                                    "div"
                                );


                            imagesContainer.style.display =
                                "flex";


                            imagesContainer.style.gap =
                                "12px";


                            imagesContainer.style.flexWrap =
                                "wrap";


                            imagesContainer.style.marginTop =
                                "15px";


                            disease.images.forEach(
                                function(image) {

                                    const img =
                                        document.createElement(
                                            "img"
                                        );


                                    img.src =
                                        `${cropDetailsAPI.replace(
                                            "/api",
                                            ""
                                        )}${image.image_path}`;


                                    img.alt =
                                        disease.name ||
                                        "صورة المرض";


                                    img.style.width =
                                        "120px";


                                    img.style.height =
                                        "120px";


                                    img.style.objectFit =
                                        "cover";


                                    img.style.borderRadius =
                                        "15px";


                                    imagesContainer.appendChild(
                                        img
                                    );

                                }
                            );


                            diseasesContainer.appendChild(
                                imagesContainer
                            );

                        }

                    }
                );

            }

            else {

                diseasesContainer.innerHTML = `
                    <p>
                        لا توجد أمراض مسجلة لهذا المحصول.
                    </p>
                `;

            }

        }

    }

    catch (error) {

        console.error(
            "خطأ في تحميل تفاصيل المحصول:",
            error
        );


        if (cropNameElement) {

            cropNameElement.textContent =
                "تعذر تحميل المحصول";

        }


        if (cropDescriptionElement) {

            cropDescriptionElement.textContent =
                "حدث خطأ أثناء الاتصال بالخادم.";

        }


        if (cropImagesContainer) {

            cropImagesContainer.innerHTML = `
                <p>
                    تعذر تحميل صور المحصول.
                </p>
            `;

        }


        if (diseasesContainer) {

            diseasesContainer.innerHTML = `
                <p>
                    تعذر تحميل بيانات الأمراض.
                </p>
            `;

        }

    }

}

// BACK TO CROP PAGE
if (backToCrops) {

    backToCrops.addEventListener(
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

// NEW SOIL SCAN
if (newScanBtn) {

    newScanBtn.addEventListener(
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
loadCropDetails();