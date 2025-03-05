window.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("token") !== null;
  const gallery = document.querySelector(".gallery");
  const imageGalleryModal = document.getElementById("imageGallery");
  const inputFile = document.getElementById("imageUpload");
  const downloadPicture = document.getElementById("downloadPicture");
  const categoriesButtons = document.getElementById("categories-buttons");
  const selectCategorie = document.getElementById("imageCategory");
  const modifyButton = document.getElementById("galleryCustom");

  if (isLoggedIn) {
    modifyButton.style.display = "block";
    categoriesButtons.style.display = "none";
  } else {
    modifyButton.style.display = "none";
    categoriesButtons.style.display = "block";
  }

  inputFile.onchange = (evt) => {
    const [file] = inputFile.files;
    if (file) {
      downloadPicture.src = URL.createObjectURL(file);
    }
  };

  function deleteProjet(id) {
    fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Échec de la suppression du projet");
        }
        document.getElementById("projet_" + id).remove();
        document.getElementById("modale_projet_" + id).remove();
      })
      .catch((error) => {
        console.error("Erreur :", error);
      });
  }

  function afficherProjets(
    projetsFiltres,
    conteneur,
    afficherPoubelle = false,
    afficherTitre = true
  ) {
    conteneur.innerHTML = "";
    projetsFiltres.forEach((projet) => {
      const figure = document.createElement("figure");

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
    const title = document.getElementById("imageTitle").value;
    const category = document.getElementById("imageCategory").value;

    if (fileInput.files.length > 0) {
      formData.append("image", fileInput.files[0]);
    } else {
      console.error("Aucun fichier sélectionné");
      return;
    }

    formData.append("title", title);
    if (category === "Objets") {
      formData.append("category", 1);
    } else if (category === "Appartements") {
      formData.append("category", 2);
    } else {
      formData.append("category", 3);
    }

    try {
      const response = await fetch(`http://localhost:5678/api/works`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Échec de l'ajout du projet: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      console.log("Projet ajouté :", data);

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

      if (!isLoggedIn) {
        categories.forEach((categorie) => {
          const button = document.createElement("button");
          button.textContent = categorie;
          button.classList.add("category-btn");
          button.setAttribute("data-category", categorie);
          categoriesButtons.appendChild(button);
        });

        categoriesButtons.addEventListener("click", function (event) {
          if (event.target.classList.contains("category-btn")) {
            const selectedCategory = event.target.getAttribute("data-category");
            const projetsFiltres = selectedCategory
              ? projets.filter(
                  (projet) => projet.category.name === selectedCategory
                )
              : projets;
            afficherProjets(projetsFiltres, gallery, false, true);
          }
        });
      }

      categories.forEach((categorie) => {
        const option = document.createElement("option");
        option.value = categorie;
        option.textContent = categorie;
        selectCategorie.appendChild(option);
      });

      afficherProjets(projets, gallery, false, true);
      if (isLoggedIn) {
        afficherProjets(projets, imageGalleryModal, true, false);
      }
    })
    .catch((error) => {
      console.error("Erreur :", error);
    });

  const modalGallery = document.getElementById("modalGallery");
  const modalAddImage = document.getElementById("modalAddImage");
  const modalButton = document.getElementById("modalButton");
  const backButton = document.getElementById("backButton");

  modalButton.addEventListener("click", () => {
    modalGallery.style.display = "none";
    modalAddImage.style.display = "block";
  });

  backButton.addEventListener("click", () => {
    modalGallery.style.display = "block";
    modalAddImage.style.display = "none";
  });
});
