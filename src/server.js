const knex = require('knex')
const app = require('./app')
const { PORT, DB_URL } = require('./config')

const db = knex({
    client: 'pg',
    connection: DB_URL
})

// attach the Knex instance 'db' to the app as a property called 'db'
app.set('db', db)


app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})