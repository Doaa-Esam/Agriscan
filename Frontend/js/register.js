// REGISTER PAGE
const API_URL = "https://accelerator-standard-giraffe.abasthan.app/api";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("كلمتا المرور غير متطابقتين.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    alert("البريد الإلكتروني مستخدم بالفعل.");
                } else {
                    alert(data.error || data.message || "حدث خطأ أثناء إنشاء الحساب.");
                }
                return;
            }

            alert("تم إنشاء الحساب بنجاح.");
            window.location.href = "login.html";

        } catch (error) {
            console.error("Register error:", error);
            alert("تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت وحاول مرة أخرى.");
        }
    });
}