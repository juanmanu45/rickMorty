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


async function crearContactsConPersonajes(res) {
    try {
        const response = await axios.get('https://rickandmortyapi.com/api/character');
        const personajes = response.data.results.filter(personaje => (primos(personaje.id)) || personaje.id === 1);
        const contacts = [];


        for (const personaje of personajes) {
            const properties = {
                character_id: personaje.id,
                firstname: personaje.name,
                lastname: personaje.name,
                status_character: personaje.status,
                character_species: personaje.species,
                character_gender: personaje.gender

            };

            const contact = await hubspotClient.crm.contacts.basicApi.create({ properties });

            contacts.push({
                ContactID: contact.id,
                characterid: properties.character_id,
                firstName: properties.firstname,
                lastName: properties.lastname,
                statusCharacter: properties.status_character,
                characterSpecies: properties.character_species,
                characterGender: properties.character_gender
            });
        }
        res.json(contacts);
    } catch (error) {

        res.status(500).send('Error al crear Contacts en HubSpot', error)
    }
}


app.get('/contacts', async (req, res) => {
    await crearContactsConPersonajes(res);
});

async function crearCompaniesConLocations(res) {
    try {
        const response = await axios.get('https://rickandmortyapi.com/api/location');
        const locations = response.data.results;
        const companies = [];

        for (const location of locations) {
            const properties = {
                location_id: location.id,
                name: location.name,
                location_type: location.type,
                dimension: location.dimension,
                creation_date: location.created

            };

            const company = await hubspotClient.crm.companies.basicApi.create({ properties });

            companies.push({
                CompanyID: company.id,
                location_id: properties.location_id,
                name: properties.name,
                location_type: properties.location_type,
                dimension: properties.dimension,
                creation_date: properties.creation_date
            });

        }

        res.json(companies);

    } catch (error) {
        console.error('Error al crear Companies en HubSpot', error);
        res.status(500).send('Error al crear Companies en HubSpot');
    }
}

app.get('/companies', async (req, res) => {
    await crearCompaniesConLocations(res);
});


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