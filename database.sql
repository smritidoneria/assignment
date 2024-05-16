
/* creating database named assignment */
CREATE DATABASE assignment;

CREATE TABLE users(
    users_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    genre_preferences TEXT[]
);

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    release_year INTEGER
);

CREATE TABLE user_ratings (
    user_id INTEGER REFERENCES users(id),
    movie_id INTEGER REFERENCES movies(id),
    rating INTEGER,
    PRIMARY KEY (user_id, movie_id)
);