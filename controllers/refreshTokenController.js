const sql = require('sqlite3').verbose();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT)");
const GetUserWithToken = 'SELECT * FROM UserTable WHERE refreshToken = ?';
const UpdateToken = 'UPDATE UserTable SET refreshToken = ? WHERE username = ?';

async function getUserWithToken(db, refreshToken) {
    return new Promise((resolve, reject) => {
        db.all(GetUserWithToken, [refreshToken], (err, rows) => {
            if (err) return reject(err);
            if (!rows.length) return resolve(0);
            if (rows.length > 1) return resolve(2);
            return resolve(rows[0]);
        });
    });
}

function updateRefreshToken(db, username, refreshToken) {
    return new Promise((resolve, reject) => {
        db.run(UpdateToken, [refreshToken, username], function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

const jwt = require('jsonwebtoken')
require('dotenv').config();

const handleRefreshToken = async (req, res) => {

    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = await getUserWithToken(UserDB, refreshToken);
    if(!foundUser){
        return res.sendStatus(403); //Forbidden
    } 

    //Evaluate JWT
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);

            const roles = Object.values(JSON.parse(foundUser.roles));
            const accessToken = jwt.sign(
                { 
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );

            
            res.cookie('twj', accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 30000
            });

            res.json({accessToken})
        }
    )
}

module.exports = {handleRefreshToken};