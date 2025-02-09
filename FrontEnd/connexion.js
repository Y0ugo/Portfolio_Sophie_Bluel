let myForm = document.getElementById("myForm");

myForm.addEventListener("submit", async (event) => {
    event.preventDefault(); 

    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let spanErrorEmail = document.getElementById("errorEmail");
    let spanErrorPassword = document.getElementById("errorPassword");
    let spanErrorGeneral = document.getElementById("errorGeneral");

    spanErrorEmail.innerHTML = "";
    spanErrorPassword.innerHTML = "";
    spanErrorGeneral.innerHTML = "";

    let isValid = true;

    if (email.value === "") {
        spanErrorEmail.innerHTML = "Un email est attendu";
        spanErrorEmail.style.color = "red";
        isValid = false;
    } else if (!emailRegEx.test(email.value)) {
        spanErrorEmail.innerHTML = "L'adresse mail doit contenir des lettres, des chiffres, un @ et un point";
        spanErrorEmail.style.color = "red";
        isValid = false;
    }

    if (password.value === "") {
        spanErrorPassword.innerHTML = "Un mot de passe est attendu";
        spanErrorPassword.style.color = "red";
        isValid = false;
    }

    if (isValid) {
        console.log("Formulaire validé, envoi des données à l'API...");

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email.value, password: password.value })
            });
        
            console.log("Réponse brute de l'API :", response);
        
            // Vérifier si la réponse est bien du JSON avant de la traiter
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("L'API ne renvoie pas du JSON. Vérifie l'URL et la requête.");
            }
        
            const data = await response.json();
            console.log("Données reçues :", data);
        
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.userId);
                window.location.href = "index.html";
            } else {
                spanErrorGeneral.innerHTML = data.message || "Identifiants incorrects.";
                spanErrorGeneral.style.color = "red";
            }
        } catch (error) {
            console.error("Erreur lors de la connexion", error);
            spanErrorGeneral.innerHTML = "Problème de connexion à l'API.";
            spanErrorGeneral.style.color = "red";
        }
        
    } else {
        console.log("Le formulaire contient des erreurs.");
    }
});
