
//Express setup
const express = require('express');
const app = express();
//Create http server
const http = require('http');
const server = http.createServer(app);
//Socket IO
const { Server } = require('socket.io');
const io = new Server(server);

//Server Variables
const WEB_PORT = 32000;
const cors = require('cors');
const verifyJWT = require('./middleware/verifyJWT')
const cookieParser = require('cookie-parser')
const router = express.Router();
const credentials = require('./middleware/credentials');
const corsOptions = require('./config/corsOptions');

//middleware
const ROLES_LIST = require('./config/roles_list')
const verifyRoles = require('./middleware/verifyRoles');
const verifyToken = require('./middleware/verifyJWT');



app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

//ejs setup
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//middleware for cookies
app.use(cookieParser());

//SQL
const sql = require('sqlite3').verbose();

let GallaryDB = new sql.Database('images.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
})

let SplashDB = new sql.Database('splash.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
})

let UserDB = new sql.Database('user.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
})

GallaryDB.run("CREATE TABLE IF NOT EXISTS ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight, Catagory)")
SplashDB.run("CREATE TABLE IF NOT EXISTS SplashTable(id, line, credit)")
UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT, createdDate TEXT, lastLogin TEXT)");
UserDB.run("CREATE TABLE IF NOT EXISTS IPTable(IP TEXT PRIMARY KEY COLLATE NOCASE, createTime TEXT, lastTime TEXT)");

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


//Tags all requests with cookies
app.use(function(req, res, next){
    next();
});


//Middleware Routes
app.use('/three', express.static('three'))

//API Routes
app.use('/', require('./routes/root'));
app.use('/reg', require('./routes/register'))
app.use('/quarryusr', require('./routes/quarryusr'))
app.use('/auth', require('./routes/auth'))
app.use('/refresh', require('./routes/refresh'))
app.use('/logout', require('./routes/logout'))
app.use('/verify', require('./routes/protectedRoute'))
app.use('/verifyadmin', require('./routes/adminRoute'))


//Regular Routes
app.get('/about',(req, res) => {
    res.render('about');
});

app.get('/register',(req, res) => {
    res.render('register');
});

app.get('/login',(req, res) => {
    res.render('login');
});

app.get('/vael',(req, res) => {
    res.render('vael');
});

//Vael Partials for HTMX
app.get('/vaelmain',(req, res) => {
    res.render('partials/Vael/vaelmain');
});

app.get('/vaelabout',(req, res) => {
    res.render('partials/Vael/vaelabout');
});
app.get('/vaelportfolio',(req, res) => {
    res.render('partials/Vael/vaelportfolio');
});


//Controlled Routes
app.use('/QuarryUserDetails', verifyRoles(ROLES_LIST.User), require('./routes/quarryuserdetails'));

//Default Route
app.get('*', (req, res) => {
    res.render('WIP');
});

//Socket IO
io.on('connection', (socket) => {
    console.log("Client Connected");
});
