
// PROFILE PAGE
const PROFILE_API_URL =
    "https://accelerator-standard-giraffe.abasthan.app/api";


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


// LOAD PROFILE DATA
async function loadProfileData() {

    const token =
        localStorage.getItem(
            "agriscan_token"
        );


    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (
        !profileName ||
        !profileEmail
    ) {

        return;

    }


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${PROFILE_API_URL}/auth/me`,
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

            localStorage.removeItem(
                "agriscan_token"
            );

            localStorage.removeItem(
                "agriscan_user"
            );

            window.location.href =
                "login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load profile"
            );

        }


        const user =
            await response.json();


        // DISPLAY USER NAME
        profileName.textContent =
            user.name ||
            "غير متاح";


        // DISPLAY USER EMAIL
        profileEmail.textContent =
            user.email ||
            "غير متاح";

    }

    catch (error) {

        console.error(
            "خطأ في تحميل بيانات الملف الشخصي:",
            error
        );


        profileName.textContent =
            "تعذر تحميل البيانات";


        profileEmail.textContent =
            "تعذر تحميل البيانات";

    }

}


// START
loadProfileData();