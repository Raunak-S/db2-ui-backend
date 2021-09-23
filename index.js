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
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


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

app.get('/columns', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query("select COLNAME, COLNO, TYPENAME, LENGTH from syscat.columns where tabname='PERSONS'").then(data => {
            res.send(data);
            db.closeSync();
        }, err => {
            console.log(err);
        })
    })
})

app.delete('/deleteRow/:firstName', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query(`delete from Persons where FirstName='${req.params.firstName}'`).then(() => {
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

app.get('/getInfo', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.getInfo(ibmdb.SQL_ACCESSIBLE_TABLES, (error, data) => {
            if (error) throw error;
            res.send(data)
            db.closeSync()
        })
    })
})

app.post('/query', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query(req.body.commands).then(data => {
            res.send(data)
            db.closeSync()
        }, err => {
            res.error(err)
        })
    })
})

app.get('/getTables', (req, res) => {
    pool.open(connStr, (err, db) => {
        if (err) throw err;
        db.query(`select tabname, tabschema from syscat.tables`).then(data => {
            res.send(data.filter(table => {
                return table.TABSCHEMA === 'DB2INST1'
            }))
            db.closeSync()
        }, err => {
            res.error(err)
        })
    })
})

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})