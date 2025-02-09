window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const imageGalleryModal = document.getElementById("imageGallery");
  const menuCategories = document.getElementById("menu-categories");

  // Récupérer les projets depuis l'API
  fetch("http://localhost:5678/api/works")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des projets");
      }
      return response.json();
    })
    .then((projets) => {
      const categories = [
        ...new Set(projets.map((projet) => projet.category.name)),
      ];

      // Générer dynamiquement le menu de catégories
      categories.forEach((categorie) => {
        const option = document.createElement("option");
        option.value = categorie;
        option.textContent = categorie;
        menuCategories.appendChild(option);
      });

      // Fonction de suppression de projet
      function deleteProjet(id, element) {
        fetch(`http://localhost:5678/api/works/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajoute un token si nécessaire
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Échec de la suppression du projet");
            }
            return response.json();
          })
          .then(() => {
            element.remove(); // Supprimer du DOM
          })
          .catch((error) => {
            console.error("Erreur :", error);
          });
      }

      // Fonction pour afficher les projets
      function afficherProjets(
        projetsFiltres,
        conteneur,
        afficherPoubelle = false,
        afficherTitre = true
      ) {
        conteneur.innerHTML = "";
        projetsFiltres.forEach((projet) => {
          const figure = document.createElement("figure");
          figure.setAttribute("id", "projet_" + projet.id);

          const img = document.createElement("img");
          img.src = projet.imageUrl;
          img.alt = projet.title;

          figure.appendChild(img);

          if (afficherPoubelle) {
            const img_trash = document.createElement("img");
            img_trash.src = "assets/icons/poubelle.png";
            img_trash.alt = "supprimer";
            img_trash.classList.add("delete");

            // Ajoute un écouteur d'événement sur l'icône de suppression
            img_trash.addEventListener("click", () => {
              deleteProjet(projet.id, figure);
            });

            figure.appendChild(img_trash);
          }

          if (afficherTitre) {
            const caption = document.createElement("figcaption");
            caption.textContent = projet.title;
            figure.appendChild(caption);
          }

          conteneur.appendChild(figure);
        });
      }

      function afficherImageProjet() {
        afficherProjets(projets, gallery, false, true); // Galerie principale
        afficherProjets(projets, imageGalleryModal, true, false); // Modale avec suppression
      }

      afficherImageProjet();

      // Filtrer les projets selon la catégorie sélectionnée
      menuCategories.addEventListener("change", function (event) {
        const selectedCategory = event.target.value;
        const projetsFiltres = selectedCategory
          ? projets.filter(
              (projet) => projet.category.name === selectedCategory
            )
          : projets;
        afficherProjets(projetsFiltres, gallery, false, true);
      });
    })
    .catch((error) => {
      console.error("Erreur :", error);
    });
});
