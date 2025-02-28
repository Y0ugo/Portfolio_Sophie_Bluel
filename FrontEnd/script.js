window.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".gallery");
  const imageGalleryModal = document.getElementById("imageGallery");
  const menuCategories = document.getElementById("menu-categories");
  const inputFile = document.getElementById("imageUpload");
  const downloadPicture = document.getElementById("downloadPicture");

  inputFile.onchange = (evt) => {
    const [file] = inputFile.files;
    if (file) {
      downloadPicture.src = URL.createObjectURL(file);
    }
  };

  // Fonction de suppression de projet
  function deleteProjet(id) {
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
      })
      .then(() => {
        document.getElementById("projet_" + id).remove();
        document.getElementById("modale_projet_" + id).remove();

        return response.json();
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

      //si c'est la modale

      if (!afficherTitre) {
        figure.setAttribute("id", "modale_projet_" + projet.id);
      } else {
        figure.setAttribute("id", "projet_" + projet.id);
      }

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
          deleteProjet(projet.id);
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
  const addProject = document.getElementById("formulaireAjoutProjet");

  addProject.onsubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById("imageUpload");
    const title = document.getElementById("imageTitle").value; // Titre
    //const categoryId = document.getElementById("imageCategory").value; // Catégorie
    // const userId = localStorage.getItem("userId"); // Récupérer l'ID utilisateur

    // Ajoute les données au FormData
    if (fileInput.files.length > 0) {
      formData.append("image", fileInput.files[0]); // Utilisez 'imageUrl' pour le champ du fichier
    } else {
      console.error("Aucun fichier sélectionné");
      return;
    }

    formData.append("title", title);
    formData.append("category", Number(1));

    try {
      console.log(formData);
      const response = await fetch(`http://localhost:5678/api/works`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token d'authentification si nécessaire
        },
      });

      if (!response.ok) {
        throw new Error("Échec de l'ajout du projet");
      }

      const data = await response.json();
      console.log("Projet ajouté :", data);

      // Mettre à jour l'interface utilisateur ou rafraîchissez la galerie
      fetch("http://localhost:5678/api/works")
        .then((response) => response.json())
        .then((projets) => {
          afficherProjets(projets, gallery, false, true);
          afficherProjets(projets, imageGalleryModal, true, false);
        })
        .catch((error) =>
          console.error("Erreur lors du rafraîchissement des projets :", error)
        );
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet :", error);
    }
  };
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

      const selectCategorie = document.getElementById("imageCategory"); // Sélection du select dans la modale
      selectCategorie.innerHTML = '<option value=""></option>'; // Réinitialisation

      categories.forEach((categorie) => {
        const option = document.createElement("option");
        option.value = categorie;
        option.textContent = categorie;
        selectCategorie.appendChild(option);
      });

      afficherProjets(projets, gallery, false, true); // Galerie principale
      afficherProjets(projets, imageGalleryModal, true, false); // Modale avec suppression

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

  // Sélection des éléments de la modale
  const modalGallery = document.getElementById("modalGallery");
  const modalAddImage = document.getElementById("modalAddImage");
  const modalButton = document.getElementById("modalButton");
  const backButton = document.getElementById("backButton");

  // Quand on clique sur "Ajouter une photo", on cache la galerie et on affiche la 2e modale
  modalButton.addEventListener("click", () => {
    modalGallery.style.display = "none";
    modalAddImage.style.display = "block";
  });

  // Quand on clique sur "Précédent", on revient à la galerie
  backButton.addEventListener("click", () => {
    modalGallery.style.display = "block";
    modalAddImage.style.display = "none";
  });
});
