export async function getTotalRecipeCount() {
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    let total = 0;
  
    for (const letter of letters) {
      const API_URL = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.meals) {
          total += data.meals.length;
        }
      } catch (error) {
        console.error(`Error fetching recipes for letter ${letter}:`, error);
      }
    }
    return total;
  }
  
  // New function to get total ingredient count
  export async function getTotalIngredientCount() {
    const API_URL = "https://www.themealdb.com/api/json/v1/1/list.php?i=list";
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      // data.meals is an array of ingredient objects
      return data.meals ? data.meals.length : 0;
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      return 0;
    }
  }

  

























  