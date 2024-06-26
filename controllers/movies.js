const express = require('express');
const pool=require("../db");
const path = require('path');
const fs = require('fs').promises;


// function to registering movie in the database
exports.moviereg = async (req, res, next) => {
    try{
      const moviesPath = path.join(__dirname, 'movies.json');
      const data = await fs.readFile(moviesPath, 'utf8');
        const movies = JSON.parse(data);
        const insertPromises = movies.map(async (movie) => {
            const { title, genre, release_year } = movie;
            const result = await pool.query('INSERT INTO movies (title, genre, release_year) VALUES ($1, $2, $3) RETURNING *', [title, genre, release_year]);
            return result.rows[0];
          });
      
          const insertedMovies = await Promise.all(insertPromises);
      
          res.status(201).json({
            success: true,
            message: 'Movies registered successfully',
            movies: insertedMovies,
          });
    }catch (error) {
        console.error('Error registering movies:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to register movies',
          error: error.message,
        });
      }
}


exports.getmovie = async (req, res, next) => {
  try{
    const result = await pool.query('SELECT * FROM movies');
    res.json(result.rows);
  }catch(error){
    console.error('Error getting movies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get movies',
      error: error.message,
    });
  }
}