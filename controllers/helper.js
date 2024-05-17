const pool = require("../db");

// helper functions for preferences1

//function to get the user prefernces
async function getUserPreferences(userId) {
    const query = 'SELECT genre_preferences FROM users WHERE users_id = $1';
    
    const result = await pool.query(query, [userId]);
    
    return result.rows[0].genre_preferences;
}

// Function to get movies matching user genre preferences
async function getRecommendedMovies1(genrePreferences) {
    console.log("||||");
    const query = 'SELECT * FROM movies WHERE genre = ANY($1)';
    const result = await pool.query(query, [genrePreferences]);
    console.log("}}}}",result);
    return result.rows;
}


//helper functions for preferences2

//function to get the movies based upon the highest ratings
async function getRecommendedMovies(userId) {
    const highlyRatedMovies = await getHighlyRatedMovies(userId);
    let recommendedMovies = [];
    for (const movie of highlyRatedMovies) {
      const similarMovies = await findSimilarMovies(movie);
      recommendedMovies.push(...similarMovies);
    }
  
    recommendedMovies = recommendedMovies
      .filter((movie, index, self) => self.findIndex(m => m.id === movie.id) === index) 
      .sort((a, b) => b.similarityScore - a.similarityScore); 
    return recommendedMovies;
}


// function to retrieve movies highly rated by the user
async function getHighlyRatedMovies(userId) {
   const query = `
      SELECT movies.*, user_ratings.rating
      FROM movies
      JOIN user_ratings ON movies.id = user_ratings.movie_id
      WHERE user_ratings.user_id = $1
      AND user_ratings.rating >= 3; -- Assuming 4 or above is considered highly rated
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}


// function to find similar movies for a given movie
async function findSimilarMovies(movie) {
    const query = `
      SELECT *
      FROM movies
      WHERE genre = $1
      AND id != $2; -- Exclude the given movie
    `;
    const result = await pool.query(query, [movie.genre, movie.id]);
  
   
    return result.rows.map(similarMovie => ({
      ...similarMovie,
      similarityScore: calculateSimilarityScore(movie, similarMovie)
    }));
}

function calculateSimilarityScore(movieA, movieB) {
    const releaseYearWeight = 1; 
    const releaseYearDifference = Math.abs(movieA.release_year - movieB.release_year);
    const maxYearDifference = 100; 
    const releaseYearSimilarity = 1 - (releaseYearDifference / maxYearDifference); // Normalize to [0, 1]
    const similarityScore = releaseYearWeight * releaseYearSimilarity;
    return similarityScore;
}



//helper functions for preferences3

// function to find the similar users
async function findSimilarUsers(targetUserId) {
    try {
       const targetUserRatings = await getRatingsByUserId(targetUserId);
       const allUserRatings = await getAllUserRatingsExceptUserId(targetUserId);
       const similarUsers = [];

       
        for (const user of allUserRatings) {
           const commonMovies = targetUserRatings.filter(targetRating =>
                user.ratings.some(userRating => userRating.movieId === targetRating.movieId)
            );

            // Movies with the same ratings
            const sameRatingMovies = commonMovies.filter(targetRating =>
                user.ratings.some(userRating =>
                    userRating.movieId === targetRating.movieId && userRating.rating === targetRating.rating
                )
            );

            // Checking if the commonmovies length is greater than 4 and have the same ratings
            if (commonMovies.length >= 4 && sameRatingMovies.length >= 4) {
               
                const moviesRatedBySimilarUser = user.ratings.map(rating => rating.movieId);
                // Filter out movies that have already been rated by the target user
                const unratedMovies = moviesRatedBySimilarUser.filter(movieId =>
                    !targetUserRatings.some(targetRating => targetRating.movieId === movieId)
                );

                similarUsers.push({ userId: user.userId, unratedMovies });
            }
        }
        console.log("pppp",similarUsers);
        return similarUsers;
    } catch (error) {
     
        console.error('Error finding similar users:', error);
        throw error;
    }
}


// function to retrieve movie ratings by user ID from the database
async function getRatingsByUserId(userId) {
    try {
        const query = 'SELECT movie_id, rating FROM user_ratings WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        const ratings = rows.map(row => ({
            movieId: row.movie_id,
            rating: row.rating
        }));

        return ratings;
    } catch (error) {
        console.error('Error fetching ratings by user ID:', error);
        throw error;
    }
}


// function to retrieve movie ratings for all users except the specified user ID from the database
async function getAllUserRatingsExceptUserId(userId) {
    try {
        const query = 'SELECT user_id, movie_id, rating FROM user_ratings WHERE user_id != $1';
        const { rows } = await pool.query(query, [userId]);
        const userRatings = {};

  
        rows.forEach(row => {
            if (!userRatings[row.user_id]) {
                userRatings[row.user_id] = [];
            }
            userRatings[row.user_id].push({ movieId: row.movie_id, rating: row.rating });
        });

      
        const allUserRatings = Object.entries(userRatings).map(([userId, ratings]) => ({
            userId,
            ratings
        }));

        return allUserRatings;
    } catch (error) {
        console.error('Error fetching all user ratings except for user ID:', error);
        throw error;
    }
}

// function to retrieve the recommended movies
async function getRecommendedMoviesCollab(targetUserId) {
    try {
        console.log("|||",targetUserId);
        const similarUsers = await findSimilarUsers(targetUserId);
        console.log("||||",similarUsers);
        
        const unratedMovies = [];
        for (const user of similarUsers) {
            unratedMovies.push(...user.unratedMovies);
        }

       const uniqueUnratedMovies = [...new Set(unratedMovies)]; 
       console.log(uniqueUnratedMovies)
        return uniqueUnratedMovies;
    } catch (error) {
        console.error('Error getting recommended movies:', error);
        throw error;
    }
}



module.exports = {
    getUserPreferences,
    getRecommendedMovies1,
    getRecommendedMovies,
    getRatingsByUserId,
    getAllUserRatingsExceptUserId,
    getRecommendedMoviesCollab
};



