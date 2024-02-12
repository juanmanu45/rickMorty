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

async function crearContactosYCompanias(res) {

    try {

        const { data: locationsData } = await axios.get('https://rickandmortyapi.com/api/location');
        const { data: charactersData } = await axios.get('https://rickandmortyapi.com/api/character');

        const characters = charactersData.results.filter(character => primos(character.id) || character.id === 1);
        const locations = locationsData.results;

        const companies = [];
        const contacts = [];
        var contact;
        var company;

        try {
            for (const location of locations) {
                const properties = {
                    location_id: location.id,
                    name: location.name,
                    location_type: location.type,
                    dimension: location.dimension,
                    creation_date: location.created

                };

                company = await hubspotClient.crm.companies.basicApi.create({ properties });

                companies.push({
                    CompanyID: company.id,
                    location_id: properties.location_id,
                    name: properties.name,
                    location_type: properties.location_type,
                    dimension: properties.dimension,
                    creation_date: properties.creation_date
                });

            }
        } catch (error) {
            res.status(500).json('error al crear Companies:', error)
        }

        try {

            for (const character of characters) {
                const fullName = character.name.split(" ");
                const firstName = fullName[0];
                const lastName =fullName[1]; 
                
                const properties = {
                    character_id: character.id,
                    firstname: firstName,
                    lastname: lastName,
                    status_character: character.status,
                    character_species: character.species,
                    character_gender: character.gender

                };

                contact = await hubspotClient.crm.contacts.basicApi.create({ properties });

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

        } catch (error) {
            res.status(500).json('Error al crear Contacts:', error)
        }
     
        res.status(200).json({ companies, contacts })  
    } catch (error) {
        console.error('Error al invocar el API:', error);
    }
}


app.post('/webhook', (req, res) => {
    console.log('Datos recibidos:', req.body);
    // Aquí puedes procesar los datos recibidos en req.body
    res.status(200).send({ message: 'Datos recibidos con éxito' });
  });


app.get('/create', async (req, res) => {
    await crearContactosYCompanias(res);
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