const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const memoryStore = new session.MemoryStore();

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore});

app.use(keycloak.middleware());

app.get('/', (req, res) => {
    res.send('<h1>HealthX Application</h1><a href="/secure"><button>Access Diadema</button></a>');
});

app.get('/secure', keycloak.protect(), (req, res) => {
    res.send('<h1>HealthX Application</h1><a href="/fetch-diadema-data"><button>Access Dashboard</button></a><a href="/fetch-cases"><button>Access Cases</button></a>');
});

app.get('/fetch-diadema-data', keycloak.protect(), async (req, res) => {
    const token = req.kauth.grant.access_token.token;

    try {
        const response = await axios.get('http://localhost:4000/api/dashboard', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});


app.get('/fetch-cases', keycloak.protect(), async (req, res) => {
    const token = req.kauth.grant.access_token.token;

    try {
        const response = await axios.get('http://localhost:4000/api/cases', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response.status).json(error.response.data);
    }
});


app.listen(3000, () => {
    console.log('HealthX app listening on port 3000');
});
