export function setupSearchForm() {
    const searchForm = document.getElementById('serach-form'); // Keeping original ID
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-content');
    const paginationContainer = document.querySelector('.paganation'); // Updated to match your UI
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const pageIndicator = document.getElementById("page-indicator");

    let allResults = [];
    let currentPage = 1;
    const RESULTS_PER_PAGE = 12;



    function updateSearchTitle(query) {
        const searchTitleElement = document.getElementById("search-title");
        if (searchTitleElement) {
            searchTitleElement.innerHTML = `Search Result for "<strong>${query}</strong>"`;
        }
    }
    
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || localStorage.getItem('searchQuery');
    
        if (query) {
            updateSearchTitle(query); // Update search title
            loadAndRenderResults(query); // Load and render search results
        }
    }
    

    // Ensure search form exists before adding event listener
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchValue = searchInput.value.trim();

            if (!searchValue) {
                if (resultsContainer) {
                    resultsContainer.innerHTML = '<p class="error">Please enter a search term</p>';
                }
                return;
            }

            try {
                localStorage.setItem('searchQuery', searchValue);
                window.location.href = `search.html?query=${searchValue}`;
            } catch (error) {
                console.error("Search Failed:", error);
            }
        });
    }

    // Run search results logic only if on 'search.html'
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || localStorage.getItem('searchQuery');

        if (query) {
            loadAndRenderResults(query);
        }
    }

    async function loadAndRenderResults(query) {
        try {
            const API_URL = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
            const response = await fetch(API_URL);
            const data = await response.json();
            allResults = data.meals || [];
            currentPage = 1; // Reset page on new search
            renderResults();
        } catch (error) {
            console.error("Load failed:", error);
        }
    }

    function renderResults() {
        if (!resultsContainer || !paginationContainer) return;

        resultsContainer.innerHTML = '';

        if (allResults.length === 0) {
            resultsContainer.innerHTML = `<p class="no-results">No recipes found.</p>`;
            paginationContainer.innerHTML = '';
            return;
        }

        const startIdx = (currentPage - 1) * RESULTS_PER_PAGE;
        const paginatedResults = allResults.slice(startIdx, startIdx + RESULTS_PER_PAGE);
        const totalPages = Math.ceil(allResults.length / RESULTS_PER_PAGE);

        paginatedResults.forEach(meal => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-container");

            const imageContainer = document.createElement("div");
            imageContainer.classList.add("image-container");
            const mealImage = document.createElement("img");
            mealImage.src = meal.strMealThumb;
            mealImage.alt = meal.strMeal;
            imageContainer.appendChild(mealImage);

            const mealNameContainer = document.createElement("div");
            mealNameContainer.classList.add("meal-name-container");

            const mealName = document.createElement("h3");
            mealName.textContent = meal.strMeal;

            const likeCont = document.createElement("div");
            likeCont.classList.add("like-cont");
            const likeIcon = document.createElement("i");
            likeIcon.classList.add("fa", "fa-heart");
            likeCont.appendChild(likeIcon);

            mealNameContainer.appendChild(mealName);
            mealNameContainer.appendChild(likeCont);
            recipeCard.appendChild(imageContainer);
            recipeCard.appendChild(mealNameContainer);
            resultsContainer.appendChild(recipeCard);
           
            recipeCard.addEventListener('click', () => {
                localStorage.setItem('mealId', meal.idMeal);
                window.location.href = `recipeDetails.html?id=${meal.idMeal}`;
            });

            resultsContainer.appendChild(recipeCard);
        });

        updatePagination(totalPages);
    }

    function updatePagination(totalPages) {
        if (!paginationContainer) return;

        pageIndicator.textContent = currentPage; // Update the current page

        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage >= totalPages;
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderResults();
            }
        });

        nextBtn.addEventListener("click", () => {
            const totalPages = Math.ceil(allResults.length / RESULTS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderResults();
            }
        });
    }


    function showLoader() {
        document.getElementById("loader").style.display = "flex";
    }
    
    function hideLoader() {
        document.getElementById("loader").style.display = "none";
    }
    
    if (window.location.pathname.includes('search.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query') || localStorage.getItem('searchQuery');
    
        if (query) {
            updateSearchTitle(query);
            showLoader(); // Show loader inside content section
            loadAndRenderResults(query);
        }
    }
    
    async function loadAndRenderResults(query) {
        try {
            showLoader();
            const API_URL = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
            const response = await fetch(API_URL);
            const data = await response.json();
            allResults = data.meals || [];
            currentPage = 1;
            renderResults();
        } catch (error) {
            console.error("Load failed:", error);
        } finally {
            hideLoader(); // Hide loader when content loads
        }
    }
    
}
