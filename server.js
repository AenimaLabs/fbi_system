const express = require('express');
const app = express();
const agentes = require('./data/agentes');

app.use(express.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

// Autenticar agente
app.post('/SignIn', (req, res) => {
  const { email, password } = req.body;
  const agente = agentes.results.find((agente) => agente.email === email && agente.password === password);
  if (agente) {
    const token = generateToken(agente);
    res.cookie('token', token, { maxAge: 120000, httpOnly: true });
    res.sendFile(__dirname + '/authorized.html');
  } else {
    res.status(401).send('Credenciales incorrectas');
  }
});

// Ruta restringida
app.get('/restricted', (req, res) => {
  const token = req.cookies.token;
  if (token) {
    const agente = verifyToken(token);
    if (agente) {
      res.send(`Bienvenido, ${agente.email}!`);
    } else {
      res.status(401).send('Token inválido');
    }
  } else {
    res.status(401).send('No autenticado');
  }
});

// Generar token
function generateToken(agente) {
  return `${agente.email}:${agente.password}`;
}

// Verificar token
function verifyToken(token) {
  const [email, password] = token.split(':');
  return agentes.results.find((agente) => agente.email === email && agente.password === password);
}

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});