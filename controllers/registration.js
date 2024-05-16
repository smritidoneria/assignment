const express = require('express');
const pool=require("../db")

exports.register = async (req, res, next) => {
    try {
        const { username, genre_preferences } = req.body;
        
       
        const result = await pool.query('INSERT INTO users (username, genre_preferences) VALUES ($1, $2) RETURNING *', [username, genre_preferences]);
    
        res.status(201).json({
          success: true,
          message: 'User registered successfully',
          user: result.rows[0],
        });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to register user',
          error: error.message,
        });
      }
}
