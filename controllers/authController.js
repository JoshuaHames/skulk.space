const sql = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT)");
const GetUser = 'SELECT * FROM UserTable WHERE username = ?';
const UpdateToken = 'UPDATE UserTable SET refreshToken = ? WHERE username = ?';

async function getUsernameInDB(db, username) {
    return new Promise((resolve, reject) => {
        db.all(GetUser, [username], (err, rows) => {
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

const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ message: 'Username and Password are required.' });

    const foundUser = await getUsernameInDB(UserDB, user);
    if (foundUser == 0) return res.sendStatus(401);
    if (foundUser == 2) return res.status(409).json({ FatalError: 'Duplicate users in database! Contact a system admin.' });

    const match = await bcrypt.compare(pwd, foundUser.pass);
    if (!match) return res.sendStatus(404);

    const roles = Object.values(JSON.parse(foundUser.roles));
    console.log(roles)
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
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    );

    try {
        await updateRefreshToken(UserDB, user, refreshToken);
    } catch (err) {
        console.error("Error updating refresh token:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 10
    });
    res.json({ accessToken });
};

module.exports = { handleLogin };
