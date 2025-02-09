document.addEventListener("DOMContentLoaded", function () {
    // Fonction pour afficher la popup

    let popupBackground = document.getElementById("popBackground");
    let btnPartage = document.getElementById("galleryCustom");

    function afficherPopup() {
       
        popupBackground.classList.add("active");
    }

    // Fonction pour cacher la popup
    function cacherPopup() {
       
        popupBackground.classList.remove("active");
    }

    // Fonction d'initialisation
    function initAddEventListenerPopup() {
        // On écoute le clic sur le bouton "Modifier"
         // bouton Modifier
        if (btnPartage) {
            btnPartage.addEventListener("click", () => {
                // Afficher la popup lorsqu'on clique sur le bouton "Modifier"
                afficherPopup();
                console.log("Popup affichée");
            });
        }

        // On écoute le clic sur la div "popupBackground"
        if (popupBackground) {
            popupBackground.addEventListener("click", (event) => {
                // Si on clique en dehors de la popup (sur le fond)
                if (event.target === popupBackground) {
                    // On cache la popup
                    cacherPopup();
                    console.log("Popup cachée");
                }
            });
        }
    }
    

    // Initialisation
    initAddEventListenerPopup();
});