
// REGISTER PAGE
const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            // GET FORM VALUES
            const name =
                document.getElementById("registerName").value.trim();

            const email =
                document.getElementById("registerEmail").value.trim();

            const password =
                document.getElementById("registerPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            // CHECK PASSWORD
            if (password !== confirmPassword) {

                alert("كلمتا المرور غير متطابقتين.");

                return;

            }


            // SEND REGISTER REQUEST
            try {

                const response =
                    await fetch(
                        "http://localhost:3000/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                // REGISTER FAILED
                if (!response.ok) {

                    if (
                        response.status === 409
                    ) {

                        alert(
                            "البريد الإلكتروني مستخدم بالفعل."
                        );

                    } else {

                        alert(
                            "حدث خطأ أثناء إنشاء الحساب."
                        );

                    }

                    return;

                }


                // REGISTER SUCCESS
                alert(
                    "تم إنشاء الحساب بنجاح."
                );


                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Register error:",
                    error
                );

                alert(
                    "تعذر الاتصال بالخادم. حاول مرة أخرى."
                );

            }

        }
    );

}