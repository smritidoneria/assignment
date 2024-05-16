const express = require('express');
const pool=require("../db")
const { getRecommendedMoviesCollab,getUserPreferences,getRecommendedMovies1,getRecommendedMovies} = require("./helper");


// to store the rating of the movies
exports.rating = async (req, res, next) => {
    try {
        const { rating } = req.body;
        const movieId = req.params.movieId;
        const userId=req.params.userId;
    
        // Assuming rating is from 1 to 5 only.
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5 stars',
          });
        }
    
        // Checking if movieId exists or not
        const movieExists = await pool.query('SELECT id FROM movies WHERE id = $1', [movieId]);
        if (movieExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Movie not found',
          });
        }
    
        // Check if the userId exists in the users table
        const userExists = await pool.query('SELECT users_id FROM users WHERE users_id = $1', [userId]);
        if (userExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
          });
        }

        // Inserting or updating the user's rating for the movie
        await pool.query('INSERT INTO user_ratings (user_id, movie_id, rating) VALUES ($1, $2, $3) ON CONFLICT (user_id, movie_id) DO UPDATE SET rating = EXCLUDED.rating', [userId, movieId, rating]);
    
        res.status(200).json({
          success: true,
          message: 'Rating saved successfully',
        });
      }
       catch (error) {
        console.error('Error rating movie:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to rate movie',
          error: error.message,
        });
      }
}


//preferences

//preferences1 recommends movies based upon the generes selected by the user
exports.preferences1 = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        //helper function yo get user prefrences by genres
        const userPreferences = await getUserPreferences(userId);
        // helper function to get the movie
        const recommendedMovies = await getRecommendedMovies1(userPreferences);
    
        res.status(200).json({
          success: true,
          recommendations: recommendedMovies,
        });
      } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate recommendations',
          error: error.message,
        });
      }
}




  
//preferences2 recommends movies similar to those a user has rated highly.

exports.preferences2 = async (req, res, next) => {
    try {
        const userId = req.params.userId;
         // helper function to get the movie
        const recommendedMovies = await getRecommendedMovies(userId);
    
        res.status(200).json({
          success: true,
          recommendations: recommendedMovies,
        });
      } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate recommendations',
          error: error.message,
        });
      }
  }



//COLLARABORATIVE FILTERING APPROACH
//Approach
//first, get the ratings of the movies of the target user
//then, find out the user thant have watched similar movies with same ratings
// then, recommend some movies of that user to the target user

exports.preferences3 = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        //helper function 
        const recommendedMovies = await getRecommendedMoviesCollab(userId);
        console.log(recommendedMovies)
        const placeholders = recommendedMovies.map((id, index) => `$${index + 1}`).join(',');
        const query = `SELECT * FROM movies WHERE id IN (${placeholders})`;

        const { rows } = await pool.query(query, recommendedMovies);

        res.status(200).json({
          success: true,
          recommendations: rows,
        });
      } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to generate recommendations',
          error: error.message,
        });
      }
}



//for handling the edge Cases. the strategy for this is popularity-based recommendation
exports.popularity = async (req, res) => {
    try {
        const query = `
        SELECT DISTINCT ON (m.id) m.id, m.title, m.genre, m.release_year
        FROM movies m
        INNER JOIN user_ratings ur ON m.id = ur.movie_id
        ORDER BY m.id, ur.rating DESC
        LIMIT 10;
    `;
        const { rows } = await pool.query(query);


        res.status(200).json({ success: true, movies: rows });
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch top rated movies' });
    }

}





