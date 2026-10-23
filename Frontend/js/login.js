
// LOGIN PAGE
const LOGIN_API_URL =
    "https://accelerator-standard-giraffe.abasthan.app/api";
const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // GET FORM DATA
            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;


            // SEND LOGIN REQUEST
            try {

                const response =
                    await fetch(
                        `${LOGIN_API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                // LOGIN FAILED
                if (!response.ok) {

                    if (response.status === 401) {

                        alert(
                            "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                        );

                    } else {

                        alert(
                            "حدث خطأ أثناء تسجيل الدخول."
                        );

                    }

                    return;
                }


                // SAVE AUTHENTICATION DATA

                localStorage.setItem(
                  "agriscan_token",
                  data.token
                );

                localStorage.setItem(
                  "agriscan_user",
                   JSON.stringify(data.user)
                );


                // LOGIN SUCCESS
                alert(
                    "تم تسجيل الدخول بنجاح."
                );


                // GO TO DASHBOARD
                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "تعذر الاتصال بالخادم. حاول مرة أخرى."
                );

            }

        }
    );

}