const express = require('express')
let cors = require('cors')
let compression = require('compression')

const people = require('./routes/people')

const port = 3001
const app = express()

app.use(cors());
app.use(compression())

// Data routes
app.use('/people', people)

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
