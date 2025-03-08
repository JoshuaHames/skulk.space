const sql = require('sqlite3').verbose();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
});

UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT)");
const GetUserWithToken = 'SELECT * FROM UserTable WHERE refreshToken = ?';
const DeleteToken = 'UPDATE UserTable SET refreshToken = ? WHERE refreshToken = ?';


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

function deleteRefreshToken(db, refreshToken) {
    return new Promise((resolve, reject) => {
        db.run(DeleteToken, [null, refreshToken], function (err) {
            if (err) return reject(err);
            resolve();
        });
    });
}


const handleLogout = async (req, res) => {

    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204); //No content

    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = getUserWithToken(UserDB, refreshToken)
    if(!foundUser){
        res.clearCookie('jwt',{httpOnly: true});
        return res.sendStatus(204)
    } 

    //Delete Refresh Token in db
    deleteRefreshToken(UserDB, refreshToken)

    res.clearCookie('jwt', {httpOnly: true}) // add the flag secure: true
    res.clearCookie('twj', {httpOnly: true}) // add the flag secure: true
    res.sendStatus(204)
}

module.exports = {handleLogout};