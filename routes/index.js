const express = require('express');
const router = express.Router();
const db = require('../database');

// Home Page
router.get('/', (req, res) => {
    res.render('pages/home');
});

// Recipe List Page
router.get('/recipes', (req, res) => {
    db.query('SELECT * FROM recipes', (err, results) => {
        if (err) throw err;
        res.render('pages/recipes', { recipes: results });
    });
});

router.get('/recipe/:id', (req, res) => {
    const recipeId = req.params.id;

    db.query('SELECT * FROM recipes WHERE id = ?', [recipeId], (err, recipeResult) => {
        if (err) throw err;

        db.query('SELECT * FROM ingredients WHERE recipe_id = ?', [recipeId], (err, ingredientsResult) => {
            if (err) throw err;

            console.log("Fetched Recipe:", recipeResult[0]); // Debugging
            console.log("Fetched Ingredients:", ingredientsResult); // Debugging

            res.render('pages/recipe-detail', {
                recipe: recipeResult[0],
                ingredients: ingredientsResult
            });
        });
    });
});


router.get('/add-recipe', (req, res) => {
    res.render('pages/add-recipe');
});

router.post('/add-recipe', (req, res) => {
    console.log("Received Data:", req.body); // Log the entire request body

    const { name, protein_type, instructions, ingredients, ingredient_info } = req.body;

    if (!name || !protein_type || !instructions) {
        return res.status(400).send("All fields are required.");
    }

    db.query(
        'INSERT INTO recipes (name, protein_type, instructions) VALUES (?, ?, ?)',
        [name, protein_type, instructions],
        (err, result) => {
            if (err) {
                console.error("Error inserting recipe:", err);
                return res.status(500).send("Error inserting recipe.");
            }

            const recipeId = result.insertId; // Get the inserted recipe ID
            console.log("Inserted Recipe ID:", recipeId);

            if (!ingredients) {
                console.log("No ingredients provided");
                return res.redirect('/recipes');
            }

            // Ensure ingredients are always stored as an array
            let ingredientArray = Array.isArray(ingredients) ? ingredients : [ingredients];
            let infoArray = Array.isArray(ingredient_info) ? ingredient_info : [ingredient_info];

            console.log("Ingredients Array:", ingredientArray);
            console.log("Ingredient Info Array:", infoArray);

            // Check if there are valid ingredients before inserting
            if (ingredientArray.length > 0 && ingredientArray[0].trim() !== "") {
                const ingredientData = ingredientArray.map((ing, i) => [recipeId, ing, infoArray[i] || ""]);

                console.log("Ingredients to Insert:", ingredientData);

                db.query(
                    'INSERT INTO ingredients (recipe_id, name, info) VALUES ?',
                    [ingredientData],
                    (err) => {
                        if (err) {
                            console.error("Error inserting ingredients:", err);
                            return res.status(500).send("Error inserting ingredients.");
                        }
                        res.redirect('/recipes');
                    }
                );
            } else {
                console.log("No valid ingredients provided");
                res.redirect('/recipes');
            }
        }
    );
});



module.exports = router;
