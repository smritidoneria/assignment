const express = require('express');
const pool=require("../db");
const fs = require('fs').promises;

exports.moviereg = async (req, res, next) => {
    try{
        const data = await fs.readFile('movies.json', 'utf8');
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