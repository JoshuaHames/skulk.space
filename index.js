
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


GallaryDB.run("CREATE TABLE IF NOT EXISTS ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight, Catagory)")
SplashDB.run("CREATE TABLE IF NOT EXISTS SplashTable(id, line, credit)")

//Image Table Quarrys
const InsertSql = 'INSERT INTO ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight) VALUES(?,?,?,?,?,?)';
const ExistSql = 'SELECT 1 as e FROM items WHERE id = ?'
const GetCount = 'SELECT item_count FROM items WHERE id = ?'

const GetAllGallery = 'SELECT * FROM ImageTable';
const GetAllPaws = 'SELECT * FROM ImageTable WHERE catagory = "paw"';
const GetAllArt = 'SELECT * FROM ImageTable WHERE catagory = "art"';
const GetAllPCM = 'SELECT * FROM ImageTable WHERE catagory = "pcm"';
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

app.get('/gallery', async (req, res) => {
    try {
        // Run all queries concurrently using Promise.all
        const [paws, art, pcm, rows] = await Promise.all([
            new Promise((resolve, reject) => {
                GallaryDB.all(GetAllPaws, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                GallaryDB.all(GetAllArt, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                GallaryDB.all(GetAllPCM, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            }),
            new Promise((resolve, reject) => {
                GallaryDB.all(GetAllGallery, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            })
        ]);

        // Prepare data object for rendering
        const data = {
            items: rows,
            pawItems: paws,
            artItems: art,
            pcmItems: pcm
        };

        // Render the gallery page with the data
        res.render('gallery', data);
    } catch (err) {
        console.error('Error fetching data from database:', err);
        res.status(500).send('Internal Server Error');
    }
});


//Page Renders
app.get('/WIP',(req, res) => {
    res.render('WIP');
});

app.get('/about',(req, res) => {
    res.render('about');
});

//Socket IO
io.on('connection', (socket) => {
    console.log("Client Connected");
});
