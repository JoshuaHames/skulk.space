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

let SplashText = [];

//SQL
const sql = require('sqlite3').verbose();

let GallaryDB = new sql.Database('images.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
	console.log('Connection to Gallery Successful');
})

let SplashDB = new sql.Database('splash.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
	console.log('Connection to Splash Successful');
})


GallaryDB.run("CREATE TABLE IF NOT EXISTS ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight)")
SplashDB.run("CREATE TABLE IF NOT EXISTS SplashTable(id, line, credit)")

//Image Table Quarrys
const InsertSql = 'INSERT INTO ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight) VALUES(?,?,?,?,?,?)';
const ExistSql = 'SELECT 1 as e FROM items WHERE id = ?'
const GetCount = 'SELECT item_count FROM items WHERE id = ?'

const GetAllGallery = 'SELECT * FROM ImageTable'
const GetAll = 'SELECT * FROM '

function getItems(database, table) {
    database.all(GetAll + table, [], (err,rows) =>{
        if (err) return console.error(err.message)
        SplashText = rows;
    })
}

function listDB() {
    GallaryDB.all(GetAllGallery, [], (err,rows) =>{
        if (err) return console.error(err.message)
        rows.forEach(row => {
            console.log(row.id + " " + row.imgPath);
        })
    })
}

server.listen(WEB_PORT, () => {
    console.log('listening on %d', WEB_PORT);
});


SplashText.forEach( row =>{
    console.log(row.id);
});


//Main Homepage

app.get('/splash',(req, res) => {
    SplashDB.all('SELECT * FROM SplashTable', [], (err,rows) =>{
        if (err) return console.error(err.message)

        const data = {
            items: rows,
        };
        res.render('partials/splash', data);
    });
});

app.get('/',(req, res) => {
    SplashDB.all('SELECT * FROM SplashTable', [], (err,rows) =>{
        if (err) return console.error(err.message)

        const data = {
            items: rows,
        };
        res.render('home', data);
    });
});

app.get('/gallery',(req, res) => {
    GallaryDB.all(GetAllGallery, [], (err,rows) =>{
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
