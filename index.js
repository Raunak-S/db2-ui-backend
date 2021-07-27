import ibmdb, { Pool } from "ibm_db"
import express from "express"
import cors from "cors"

const DATABASE = 'TESTDB'
const HOSTNAME = 'localhost'
const UID = 'db2inst1'
const PWD = 'password'
const PORT = 50000
const PROTOCOL = 'TCPIP'

const connStr = `DATABASE=${DATABASE};HOSTNAME=${HOSTNAME};UID=${UID};PWD=${PWD};PORT=${PORT};PROTOCOL=${PROTOCOL}`
const pool = new Pool()

const app = express()
const port = 8080

app.use(cors())

app.get('/', (req, res) => {
    res.send('API V1')
})

app.get('/rows', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query("select * from Persons").then(data => {
            res.send(data);
            db.closeSync();
        }, err => {
            console.log(err);
        });
    })
})

app.delete('/deleteRow/:firstName', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query(`delete from Persons where FirstName='${req.params.firstName}'`).then(data => {
            res.status(200)
            res.send(`Row deleted successfully\n`)
            db.closeSync
        }, err => {
            res.status(500)
            res.send(`Internal Server Error`)
            console.log(err)
        })
    })
})


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})