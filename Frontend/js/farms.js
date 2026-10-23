const FARMS_API_URL = "https://accelerator-standard-giraffe.abasthan.app/api";

// FARM PAGE MODE
const farmsParams =
    new URLSearchParams(window.location.search);

const scanMode =
    farmsParams.get("action") === "scan";

console.log("Farms Page Scan Mode:", scanMode);


// AUTH
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


// ELEMENTS
const farmsContainer =
    document.getElementById("farmsContainer");

const farmsCount =
    document.getElementById("farmsCount");

const totalArea =
    document.getElementById("totalArea");

const addFarmBtn =
    document.getElementById("addFarmBtn");

const addFarmForm =
    document.getElementById("addFarmForm");

const farmForm =
    document.getElementById("farmForm");

const cancelFarmBtn =
    document.getElementById("cancelFarmBtn");

const farmName =
    document.getElementById("farmName");

const farmLocation =
    document.getElementById("farmLocation");

const farmArea =
    document.getElementById("farmArea");

const farmCrop =
    document.getElementById("farmCrop");


// LOAD FARMS
async function loadFarms() {

    if (!farmsContainer) {
        return;
    }

    farmsContainer.innerHTML = `
        <p>جاري تحميل المزارع...</p>
    `;

    try {

        const authHeaders =
            getAuthHeaders();

        if (!authHeaders) {
            return;
        }


        const response =
            await fetch(
                `${FARMS_API_URL}/farms`,
                {
                    method: "GET",
                    headers: {
                        ...authHeaders
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل المزارع"
            );
        }


        const farms =
            await response.json();


        console.log(
            "Farms:",
            farms
        );


        // EMPTY STATE

        if (
            !Array.isArray(farms) ||
            farms.length === 0
        ) {

            farmsContainer.innerHTML = `
                <div class="empty-state">

                    <i class="fa-solid fa-wheat-awn"></i>

                    <h3>
                        لا توجد مزارع حتى الآن
                    </h3>

                    <p>
                        أضيفي أول مزرعة لبدء إدارة بياناتك.
                    </p>

                </div>
            `;


            if (farmsCount) {
                farmsCount.textContent = "0";
            }


            if (totalArea) {
                totalArea.textContent = "0";
            }


            return;
        }


        // FARM STATISTICS
        if (farmsCount) {

            farmsCount.textContent =
                farms.length;
        }


        const area =
            farms.reduce(
                function(total, farm) {

                    return (
                        total +
                        Number(
                            farm.area || 0
                        )
                    );

                },
                0
            );


        if (totalArea) {

            totalArea.textContent =
                area;
        }


        // RENDER FARMS
        farmsContainer.innerHTML = "";


        farms.forEach(function(farm) {

            const farmCard =
                document.createElement(
                    "div"
                );


            farmCard.className =
                "farm-card";


            const cropName =
                farm.crop_name ||
                farm.cropName ||
                farm.crop ||
                "غير محدد";


            farmCard.innerHTML = `

                <div class="farm-card-top">

                    <div class="farm-icon">
                        <i class="fa-solid fa-seedling"></i>
                    </div>


                    <div class="farm-title">

                        <h3>
                            ${farm.name || "مزرعة بدون اسم"}
                        </h3>

                        <span>
                            <i class="fa-solid fa-location-dot"></i>
                            ${farm.location || "الموقع غير محدد"}
                        </span>

                    </div>


                    <button
                        class="farm-menu-btn"
                        type="button"
                        data-id="${farm.id}">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>


                <div class="farm-details">

                    <div>
                        <i class="fa-solid fa-ruler-combined"></i>
                        <span>
                            ${farm.area || 0} أفدنة
                        </span>
                    </div>


                    <div>
                        <i class="fa-solid fa-leaf"></i>
                        <span>
                            ${cropName}
                        </span>
                    </div>


                    <div>
                        <i class="fa-solid fa-flask"></i>
                        <span>
                            ${farm.scans_count || 0} فحوصات
                        </span>
                    </div>

                </div>


                <!-- VIEW FARM BUTTON -->

                <button
                    class="farm-view-btn"
                    type="button"
                    data-id="${farm.id}">

                    <i class="fa-solid fa-chart-line"></i>

                    عرض المزرعة

                </button>


                <!-- START SCAN BUTTON -->

                ${
                    scanMode
                    ?
                    `
                    <button
                        class="farm-scan-btn"
                        type="button"
                        data-id="${farm.id}">

                        <i class="fa-solid fa-magnifying-glass"></i>

                        بدء فحص

                    </button>
                    `
                    :
                    ""
                }

            `;


            farmsContainer.appendChild(
                farmCard
            );


            // DELETE FARM
            const deleteBtn =
                farmCard.querySelector(
                    ".farm-menu-btn"
                );


            if (deleteBtn) {

                deleteBtn.addEventListener(
                    "click",
                    function() {

                        deleteFarm(
                            farm.id
                        );

                    }
                );

            }


            // VIEW FARM
            const viewBtn =
                farmCard.querySelector(
                    ".farm-view-btn"
                );


            if (viewBtn) {

                viewBtn.addEventListener(
                    "click",
                    function() {

                        const farmId =
                            farm.id;


                        if (!farmId) {
                            return;
                        }


                        window.location.href =
                            `farm-details.html?id=${farmId}`;

                    }
                );

            }


            // START SCAN
            const scanBtn =
                farmCard.querySelector(
                    ".farm-scan-btn"
                );


            if (scanBtn) {

                scanBtn.addEventListener(
                    "click",
                    function() {

                        const farmId =
                            farm.id;


                        if (!farmId) {
                            return;
                        }


                        window.location.href =
                            `connect-device.html?farmId=${farmId}`;

                    }
                );

            }

        });

    }
    catch (error) {

        console.error(
            "Error loading farms:",
            error
        );


        farmsContainer.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    تعذر تحميل المزارع
                </h3>

                <p>
                    تأكدي أن الـ Backend يعمل وأن MySQL متصل.
                </p>

            </div>
        `;

    }

}


// LOAD CROPS
async function loadCrops() {

    if (!farmCrop) {
        return;
    }


    try {

        const response =
            await fetch(
                `${FARMS_API_URL}/crops`
            );


        if (!response.ok) {

            throw new Error(
                "فشل تحميل المحاصيل"
            );
        }


        const crops =
            await response.json();


        farmCrop.innerHTML = `
            <option value="">
                اختاري المحصول
            </option>
        `;


        if (Array.isArray(crops)) {

            crops.forEach(function(crop) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    crop.id;


                option.textContent =
                    crop.name;


                farmCrop.appendChild(
                    option
                );

            });

        }

    }
    catch (error) {

        console.error(
            "Error loading crops:",
            error
        );

    }

}


// SHOW ADD FARM FORM
if (addFarmBtn) {

    addFarmBtn.addEventListener(
        "click",
        function() {

            if (addFarmForm) {

                addFarmForm.style.display =
                    "block";

            }

        }
    );

}


// CANCEL ADD FARM
if (cancelFarmBtn) {

    cancelFarmBtn.addEventListener(
        "click",
        function() {

            if (addFarmForm) {

                addFarmForm.style.display =
                    "none";

            }


            if (farmForm) {

                farmForm.reset();

            }

        }
    );

}


// ADD FARM
if (farmForm) {

    farmForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const authHeaders =
                getAuthHeaders();


            if (!authHeaders) {
                return;
            }


            const name =
                farmName
                    ? farmName.value.trim()
                    : "";


            const location =
                farmLocation
                    ? farmLocation.value.trim()
                    : "";


            const area =
                farmArea
                    ? farmArea.value
                    : "";


            const cropId =
                farmCrop
                    ? farmCrop.value
                    : "";


            if (!name) {

                alert(
                    "من فضلك أدخلي اسم المزرعة."
                );

                return;
            }


            if (!location) {

                alert(
                    "من فضلك أدخلي موقع المزرعة."
                );

                return;
            }


            if (!area) {

                alert(
                    "من فضلك أدخلي مساحة المزرعة."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${FARMS_API_URL}/farms`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                ...authHeaders
                            },

                            body: JSON.stringify({

                                name:
                                    name,

                                location:
                                    location,

                                area:
                                    Number(area),

                                crop_id:
                                    cropId
                                        ? Number(cropId)
                                        : null

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "فشل إضافة المزرعة"
                    );
                }


                alert(
                    "تمت إضافة المزرعة بنجاح."
                );


                if (farmForm) {
                    farmForm.reset();
                }


                if (addFarmForm) {

                    addFarmForm.style.display =
                        "none";

                }


                await loadFarms();

            }
            catch (error) {

                console.error(
                    "Error adding farm:",
                    error
                );


                alert(
                    error.message ||
                    "حدث خطأ أثناء إضافة المزرعة."
                );

            }

        }
    );

}

// DELETE FARM
async function deleteFarm(farmId) {

    if (!farmId) {
        return;
    }


    const confirmed =
        confirm(
            "هل أنتِ متأكدة من حذف هذه المزرعة؟"
        );


    if (!confirmed) {
        return;
    }


    const authHeaders =
        getAuthHeaders();


    if (!authHeaders) {
        return;
    }


    try {

        const response =
            await fetch(
                `${FARMS_API_URL}/farms/${farmId}`,
                {
                    method: "DELETE",
                    headers: {
                        ...authHeaders
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "فشل حذف المزرعة"
            );
        }


        alert(
            "تم حذف المزرعة بنجاح."
        );


        await loadFarms();

    }
    catch (error) {

        console.error(
            "Error deleting farm:",
            error
        );


        alert(
            error.message ||
            "حدث خطأ أثناء حذف المزرعة."
        );

    }

}

// INITIAL LOAD
loadFarms();
loadCrops();