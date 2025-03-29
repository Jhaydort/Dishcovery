import { getTotalRecipeCount, getTotalIngredientCount, } from './api.js';
import {setupSearchForm } from './newSearch.js';



// Animate a counter element from 0 to the target value
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const steps = duration / 50;
    const increment = Math.ceil(target / steps);

    function updateRecipeValue() {
        start += increment;
        if (start < target) {
            element.innerText = start;
            setTimeout(updateRecipeValue, 50);
        } else {
            element.innerText = target;
        }
    }
    updateRecipeValue();
}
// count animation
async function updateCounters() {
    const recipeCount = await getTotalRecipeCount();
    const ingredientCount = await getTotalIngredientCount();

    const recipeCounterElement = document.querySelector('.countdown');
    const ingredientCounterElement = document.querySelector('.ingredient-counter');

    animateCounter(recipeCounterElement, recipeCount, 2000);
    animateCounter(ingredientCounterElement, ingredientCount, 2000);
}

document.addEventListener("DOMContentLoaded", updateCounters);

document.addEventListener("DOMContentLoaded", () => {
    const recipeContainer = document.getElementById("container-for-recipe");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const pageIndicator = document.getElementById("page-indicator");

    let allRecipes = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    // function to fecth recipes

    async function fetchAllRecipes() {
        const letters = "abcdefghijklmnopqrstuvwxyz".split("");
        let recipes = [];
        for (const letter of letters) {
            const API_URL = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                if (data.meals) recipes.push(...data.meals);
            } catch (error) {
                console.error(`Error fetching recipes for letter ${letter}:`, error);
            }
        }
        return recipes;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayPage(page) {
      
        recipeContainer.innerHTML = "";
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageRecipes = allRecipes.slice(startIndex, endIndex);

        pageRecipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-container");
            recipeCard.addEventListener("click", () => {
                localStorage.setItem("mealId", recipe.idMeal);
                window.location.href = "recipeDetails.html";
            });

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            const mealImage = document.createElement("img");
            mealImage.src = recipe.strMealThumb;
            mealImage.alt = recipe.strMeal;
            imageContainer.appendChild(mealImage);

            const mealNameContainer = document.createElement("div");
            mealNameContainer.classList.add("meal-name-container");

            const mealName = document.createElement("h3");
            mealName.textContent = recipe.strMeal;

            const likeCont = document.createElement("div");
            likeCont.classList.add("like-cont");
            const likeIcon = document.createElement("i");
            likeIcon.classList.add("fa", "fa-heart");
            likeCont.appendChild(likeIcon);

            mealNameContainer.appendChild(mealName);
            mealNameContainer.appendChild(likeCont);
            recipeCard.appendChild(imageContainer);
            recipeCard.appendChild(mealNameContainer);
            recipeContainer.appendChild(recipeCard);
        });

        updatePaginationControls();
    }

    function updatePaginationControls() {
        const totalPages = Math.ceil(allRecipes.length / itemsPerPage);
        pageIndicator.textContent = `${currentPage} / ${totalPages}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    async function init() {
        allRecipes = await fetchAllRecipes();
        allRecipes = shuffleArray(allRecipes);
        displayPage(currentPage);
    }

    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(allRecipes.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    init();
});

async function loadRecipeDetails() {
    const mealId = localStorage.getItem("mealId");
    if (!mealId) {
        console.error("No mealId found in localStorage!");
        return;
    }

    try {
        const API_URL = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.meals) {
            console.error("No recipe found!");
            return;
        }

        const meal = data.meals[0];
        updateRecipeDetailsUI(meal);
    } catch (error) {
        console.error("Error fetching recipe details:", error);
    }
}

function updateRecipeDetailsUI(meal) {
    const titleElement = document.getElementById("meal-name");
    const imageElement = document.querySelector("#meal-img img");
    const instructionsElement = document.querySelector(".ingredients-list");
    instructionsElement.innerHTML = "";
    const instructionList = document.createElement("ol");
    const steps = meal.strInstructions.split(". ");

    steps.forEach((step, index) => {
        if (step.trim() !== "") {
            const listItem = document.createElement("li");
            listItem.textContent = step.trim();
            instructionList.appendChild(listItem);
        }
    });

    instructionsElement.appendChild(instructionList);

    const stepsHeader = document.querySelector(".ttt-step");
    const ingredientsList = document.querySelector(".ingreddenss");
    const mealLocation = document.getElementById("meal-location");
    const mealCategory = document.getElementById("meal-category");
    const mealTag = document.getElementById("tag-meal");
    const youtubeLink = document.querySelector(".youtube-link");

    youtubeLink.innerHTML = "";

    const youtubeUrl = meal.strYoutube;
    if (youtubeUrl) {
        const linkElement = document.createElement("a");
        linkElement.href = youtubeUrl;
        linkElement.target = "_blank";
        linkElement.classList.add("meal-link");
        linkElement.innerHTML = `See YouTube Video`;
        youtubeLink.appendChild(linkElement);
    }

    titleElement.innerHTML = meal.strMeal;
    imageElement.src = meal.strMealThumb;
    mealLocation.innerHTML = `from ${meal.strArea}`;
    stepsHeader.textContent = `Steps for the ${meal.strMeal}:`;
    mealCategory.innerHTML = meal.strCategory;
    mealTag.innerHTML = meal.strTags;

    ingredientsList.innerHTML = "";

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
            const listItem = document.createElement("li");
            listItem.textContent = `${ingredient} - ${measure}`;
            ingredientsList.appendChild(listItem);
        }
    }

    renderRelatedRecipes(meal.strCategory);
}

async function fetchRelatedRecipes(category) {
  const API_URL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
  const response = await fetch(API_URL);
  const data = await response.json();
  return data.meals || [];
}

async function renderRelatedRecipes(category) {
  const relatedContainer = document.querySelector(".related-rec");
  relatedContainer.innerHTML = ""; // Clear previous content
  const recipes = await fetchRelatedRecipes(category);
  const limitedRecipes = recipes.slice(0, 4); // Limit to 4 recipes

  limitedRecipes.forEach((meal) => {
      const mealCard = document.createElement("div");
      mealCard.classList.add("recipe-container");
      

      // Add onclick event to the meal card
      mealCard.addEventListener("click", () => {
          localStorage.setItem("mealId", meal.idMeal);
          window.location.href = "recipeDetails.html";
      });

      const imageContainer = document.createElement("div");
      imageContainer.classList.add("image-container");
      const mealImage = document.createElement("img");
      mealImage.src = meal.strMealThumb;
      mealImage.alt = meal.strMeal;
      imageContainer.appendChild(mealImage);

      const mealName = document.createElement("h3");
      mealName.textContent = meal.strMeal;

      mealCard.appendChild(imageContainer);
      mealCard.appendChild(mealName);
      relatedContainer.appendChild(mealCard);
  });
  
}

document.addEventListener('DOMContentLoaded', loadRecipeDetails);
document.addEventListener('DOMContentLoaded', setupSearchForm);


