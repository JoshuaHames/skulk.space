//Express setup
const express = require('express');
const app = express();

//ejs setup
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json());

//Create http server
const http = require('http');
const server = http.createServer(app);
 
//Socket IO
const { Server } = require('socket.io');
const io = new Server(server);

//Server Variables
const WEB_PORT = 32000;

//SQL
const sql = require('sqlite3').verbose();

let db = new sql.Database('images.db', sql.OPEN_READWRITE, (err) =>{
	if(err) return console.error(err.message);
	console.log('Connection Successful');
})


db.run("CREATE TABLE IF NOT EXISTS ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight)")

const InsertSql = 'INSERT INTO ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight) VALUES(?,?,?,?,?,?)';
const ExistSql = 'SELECT 1 as e FROM items WHERE id = ?'
const GetCount = 'SELECT item_count FROM items WHERE id = ?'
const GetAll = 'SELECT * FROM ImageTable'

function addImage(id, path, title, desc) {
    db.run(InsertSql, [id, path, title, desc], (err) => {
        if (err) return console.error(err.message)
        console.log('New row created for: ' + id)
    });
}

function getItems() {
    db.all(GetAll, [], (err,rows) =>{
        if (err) return console.error(err.message)
        return rows;
    })
}


function listDB() {
    db.all(GetAll, [], (err,rows) =>{
        if (err) return console.error(err.message)
        rows.forEach(row => {
            console.log(row.id + " " + row.imgPath);
        })
    })
}

server.listen(WEB_PORT, () => {
    console.log('listening on %d', WEB_PORT);
});

listDB();

//Main Homepage
app.get('/', (req,res) => res.render('home'));

app.get('/gallery',(req, res) => {
    db.all(GetAll, [], (err,rows) =>{
        if (err) return console.error(err.message)

        const data = {
            items: rows,
        };
        res.render('gallery', data);
    });
});

io.on('connection', (socket) => {
    console.log("Client Connected");
});
