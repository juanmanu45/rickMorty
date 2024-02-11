const express = require('express');
const axios = require('axios');
const hubspot = require('@hubspot/api-client')

const app = express();
const port = 3000;


const hubspotClient = new hubspot.Client({ accessToken: "pat-na1-91fcccbc-3740-4d08-9d10-e31c947d8db1" })

function primos(num) {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
        if (num % i === 0) return false;
    return num > 1;
}


async function crearContactsConPersonajes() {
    try {
        const response = await axios.get('https://rickandmortyapi.com/api/character');
        const personajes = response.data.results.filter(personaje =>(primos(personaje.id)) || personaje.id === 1);


        for (const personaje of personajes) {
            const properties = {
                character_id: personaje.id,
                firstname: personaje.name,
                lastname: personaje.status,
                status_character: personaje.status,
                character_species:personaje.species,
                character_gender:personaje.gender
        
            };

            const contact = await hubspotClient.crm.contacts.basicApi.create({ properties });
            console.log(`Contacto creado con ID: ${contact.id},
                            characterid: ${properties.character_id}, 
                            firstName: ${properties.firstname},
                            lastName: ${properties.lastname},
                            statusCharacter:${properties.status_character},
                            characterStatus:${properties.character_species},
                            characterGender:${properties.character_gender}`

            );
        }
    } catch (error) {
        console.error('Error al crear contacts en HubSpot:', error);
    }
}

async function crearCompaniesConLocations(){

    try{

        const response = await axios.get('https://rickandmortyapi.com/api/location');
        const locations = response.data.results.filter(personaje =>(primos(personaje.id)) || personaje.id === 1);

    }catch(error){
        console.error('Error al crear Companies en HubSpot',error)
    }
}


crearContactsConPersonajes();
crearCompaniesConLocations();

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