const express = require('express');
const axios = require('axios'); // Si usas Axios
const app = express();
const port = 3000;


function primos(num) {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
        if (num % i === 0) return false;
    return num > 1;
}

app.get('/characters', async (req, res) => {
    try {

        const response = await axios.get('https://rickandmortyapi.com/api/character');
        const personajesPrimos = response.data.results.filter(personaje => 
            (primos(personaje.id)) || personaje.id === 1);
        
        res.json(personajesPrimos);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.get('/location', async (req, res) => {
    try {
        const response = await axios.get('https://rickandmortyapi.com/api/location');
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});