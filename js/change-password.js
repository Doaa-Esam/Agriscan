
// CHANGE PASSWORD PAGE
const CHANGE_PASSWORD_API_URL =
    "http://localhost:3000/api";


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


// PASSWORD TOAST
function showPasswordToast(
    message,
    type = "success"
) {

    const passwordToast =
        document.getElementById(
            "passwordToast"
        );

    if (!passwordToast) {
        return;
    }

    passwordToast.textContent =
        message;

    passwordToast.classList.remove(
        "show",
        "error"
    );

    if (type === "error") {

        passwordToast.classList.add(
            "error"
        );

    }

    // Force animation restart
    void passwordToast.offsetWidth;

    passwordToast.classList.add(
        "show"
    );

    setTimeout(
        function() {

            passwordToast.classList.remove(
                "show"
            );

        },
        3500
    );

}


// CHANGE PASSWORD
const changePasswordBtn =
    document.getElementById(
        "changePasswordBtn"
    );

if (changePasswordBtn) {

    changePasswordBtn.addEventListener(
        "click",
        async function() {

            const currentPassword =
                document.getElementById(
                    "currentPassword"
                ).value;

            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            // VALIDATION
            if (
                !currentPassword ||
                !newPassword ||
                !confirmPassword
            ) {

                showPasswordToast(
                    "من فضلك أدخل جميع البيانات المطلوبة.",
                    "error"
                );

                return;

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                showPasswordToast(
                    "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
                    "error"
                );

                return;

            }


            if (
                newPassword.length < 8
            ) {

                showPasswordToast(
                    "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف.",
                    "error"
                );

                return;

            }

            // TOKEN
            const token =
                localStorage.getItem(
                    "agriscan_token"
                );

            if (!token) {

                window.location.href =
                    "login.html";

                return;

            }


            // SEND REQUEST
            changePasswordBtn.disabled =
                true;

            changePasswordBtn.textContent =
                "جاري تغيير كلمة المرور...";


            try {

                const response =
                    await fetch(
                        `${CHANGE_PASSWORD_API_URL}/auth/change-password`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({

                                currentPassword:
                                    currentPassword,

                                newPassword:
                                    newPassword

                            })
                        }
                    );


                const data =
                    await response.json();


                // CURRENT PASSWORD ERROR
                if (
                    response.status === 401 &&
                    data.error ===
                    "Current password is incorrect"
                ) {

                    showPasswordToast(
                        "كلمة المرور الحالية غير صحيحة.",
                        "error"
                    );

                    return;

                }

                // TOKEN ERROR
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


                // OTHER SERVER ERRORS
                if (!response.ok) {

                    if (
                        data.error ===
                        "New password must be different"
                    ) {

                        showPasswordToast(
                            "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.",
                            "error"
                        );

                    } else {

                        showPasswordToast(
                            data.error ||
                            "حدث خطأ أثناء تغيير كلمة المرور.",
                            "error"
                        );

                    }

                    return;

                }

                // SUCCESS
                showPasswordToast(
                    "تم تغيير كلمة المرور بنجاح.",
                    "success"
                );


                document.getElementById(
                    "currentPassword"
                ).value = "";

                document.getElementById(
                    "newPassword"
                ).value = "";

                document.getElementById(
                    "confirmPassword"
                ).value = "";


            } catch (error) {

                console.error(
                    "خطأ في تغيير كلمة المرور:",
                    error
                );

                showPasswordToast(
                    "تعذر الاتصال بالخادم. حاول مرة أخرى.",
                    "error"
                );

            } finally {

                changePasswordBtn.disabled =
                    false;

                changePasswordBtn.textContent =
                    "تغيير كلمة المرور";

            }

        }
    );

}