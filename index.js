
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

let VisitDB = new sql.Database('visit.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
})

GallaryDB.run("CREATE TABLE IF NOT EXISTS ImageTable(id, imgPath, imgTitle, imgDescription, imgWidth, imgHeight, Catagory)")
SplashDB.run("CREATE TABLE IF NOT EXISTS SplashTable(id INTEGER PRIMARY KEY, line, credit)")
VisitDB.run("CREATE TABLE IF NOT EXISTS VisitTable(id INTEGER PRIMARY KEY, page TEXT, pageViews INTEGER, pageVisits INTEGER)")
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

const InsertVisitRow = 'INSERT INTO VisitTable(page, pageViews, pageVisits) VALUES(?,?,?)'
const GetPageViews = 'SELECT pageViews FROM VisitTable WHERE page = ?'
const GetPageVisits = 'SELECT pageVisits FROM VisitTable WHERE page = ?'
const SetPageViews = 'UPDATE VisitTable SET pageViews = ? WHERE page = ?'
const SetPageVisits = 'UPDATE VisitTable SET pageVisits = ? WHERE page = ?'


//Visit Counting
app.use('/updatecount', async(req,res) => {
    const {page} = req.body
    if(!page) return res.status(400).json({'message': 'A page is required'});

    if(req.url === '/favicon.ico'){
        res.end();
    }
    if(req.query.type === 'get-only'){
        try {
            const [currentPageVisits, currentPageViews] = await Promise.all([
                new Promise((resolve, reject) => {
                    VisitDB.get(GetPageViews, [page], (err, result) => {
                        if (err) return console.error(err.message)
                        resolve(result.pageViews)
                    })
                }),
                new Promise((resolve, reject) => {
                    VisitDB.get(GetPageVisits, [page], (err, result) => {
                        if (err) return console.error(err.message)
                            resolve(result.pageVisits)
                    })
                })
            ])
            res.send(JSON.stringify({ pageviews: currentPageViews, visits: currentPageVisits}))
        } catch {
            console.log("Something went wrong")
        }
    } else {
        try {
            const [currentPageVisits, currentPageViews] = await Promise.all([
                new Promise((resolve, reject) => {
                    VisitDB.get(GetPageViews, [page], (err, result) => {
                        if (err) return console.error(err.message)
                        VisitDB.run(SetPageViews, [result.pageViews + 1,page], (err) => {
                            if (err) return console.error(err.message)
                        })
                        resolve(result.pageViews + 1)
                    })
                }),
                new Promise((resolve, reject) => {
                    VisitDB.get(GetPageVisits, [page], (err, result) => {
                        if (err) return console.error(err.message)
                            if(req.query.type === 'visit-pageview'){
                                VisitDB.run(SetPageVisits, [result.pageVisits + 1,page], (err) => {
                                    if (err) return console.error(err.message)
                                })
                                resolve(result.pageVisits + 1)
                            } else {
                                resolve(result.pageVisits)
                            }

                    })
                })
            ])
            res.send(JSON.stringify({ pageviews: currentPageViews, visits: currentPageVisits}))
        } catch {
            console.log("Something went wrong")
        }
    }
})

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

//Admin Routes
//User DB Routes
app.use('/delusers', require('./routes/protected/delUsers'));
app.use('/updatepass', require('./routes/protected/updatePassword'));
//Splash DB Routes
app.use('/delsplash', require('./routes/protected/delSplash'));
app.use('/updatesplash', require('./routes/protected/updateSplash'));
app.use('/addsplash', require('./routes/protected/addSplash'));

app.use('/newvisit', require('./routes/protected/newIP'));

app.use('/manageusers', require('./routes/adminRoute'), async (req, res, next) => {
        res.render('admin/manageusers');
});
app.use('/managesplash', require('./routes/adminRoute'), async (req, res, next) => {
        res.render('admin/managesplash');
});

app.use('/fetchuserdb', require('./routes/adminRoute'), async (req, res, next) => {
    try {
        // Run all queries concurrently using Promise.all
        const [users] = await Promise.all([
            new Promise((resolve, reject) => {
                UserDB.all('Select * from UserTable',[], (err, users) => {
                    if (err) reject(err);
                    else resolve(users);
                });
            })
        ]);

        // Prepare data object for rendering
        const data = {
            users: users
        };

        // Render the gallery page with the data
        res.render('admin/userdbtable', data)
    } catch (err) {
        console.error('Error fetching data from database:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.use('/fetchsplashdb', require('./routes/adminRoute'), async (req, res, next) => {
    try {
        // Run all queries concurrently using Promise.all
        const [lines] = await Promise.all([
            new Promise((resolve, reject) => {
                SplashDB.all('Select * from SplashTable',[], (err, lines) => {
                    if (err) reject(err);
                    else resolve(lines);
                });
            })
        ]);

        // Prepare data object for rendering
        const data = {
            lines: lines
        };

        // Render the gallery page with the data
        res.render('admin/splashtable', data)
    } catch (err) {
        console.error('Error fetching data from database:', err);
        res.status(500).send('Internal Server Error');
    }
});


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
app.get('/vaeltos',(req, res) => {
    res.render('partials/Vael/vaeltos');
});
app.get('/rawtos',(req, res) => {
    res.render('partials/Vael/rawtos');
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
