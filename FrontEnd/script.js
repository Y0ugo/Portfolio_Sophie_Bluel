window.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');
  const menuCategories = document.getElementById("menu-categories");

  // On effectue un seul fetch pour récupérer les projets et les catégories
  fetch('http://localhost:5678/api/works')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des projets');
      }
      return response.json();
    })
    .then(projets => {
      // 1. Récupérer toutes les catégories uniques
      const categories = [...new Set(projets.map(projet => projet.category.name))];

      // 2. Générer dynamiquement le menu de catégories
      categories.forEach(categorie => {
        const option = document.createElement("option");
        option.value = categorie;
        option.textContent = categorie;
        menuCategories.appendChild(option);
      });

      // 3. Afficher les projets dans la galerie (initialement tous les projets)
      function afficherProjets(projetsFiltres) {
        gallery.innerHTML = '';  // Réinitialiser la galerie à chaque nouveau rendu
        projetsFiltres.forEach(projet => {
          const figure = document.createElement('figure');
          
          const img = document.createElement('img');
          img.src = projet.imageUrl;
          img.alt = projet.title;

          const caption = document.createElement('figcaption');
          caption.textContent = projet.title;

          figure.appendChild(img);
          figure.appendChild(caption);

          gallery.appendChild(figure);
        });
      }

      // Afficher tous les projets au début (avant que l'utilisateur choisisse une catégorie)
      afficherProjets(projets);

      // 4. Appliquer le filtre lorsqu'une catégorie est sélectionnée
      menuCategories.addEventListener("change", function(event) {
        const selectedCategory = event.target.value;
        
        // Filtrer les projets selon la catégorie sélectionnée
        const projetsFiltres = selectedCategory
          ? projets.filter(projet => projet.category.name === selectedCategory)
          : projets;  // Si aucune catégorie n'est sélectionnée, on affiche tous les projets
        
        afficherProjets(projetsFiltres);
      });
    })
    .catch(error => {
      console.error('Erreur :', error);
    });
});
