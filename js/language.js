
// LANGUAGE PAGE
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