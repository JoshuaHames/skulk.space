const bcrypt = require('bcrypt');
const { User } = require('../config/roles_list');
const sql = require('sqlite3').verbose();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) =>{
	if(err) return console.error(err.message);
})

UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT, createdDate TEXT, lastLogin TEXT)");
UserDB.run("CREATE TABLE IF NOT EXISTS IPTable(IP TEXT PRIMARY KEY COLLATE NOCASE, createTime TEXT, lastTime TEXT)");
const GetUser = 'SELECT * FROM UserTable WHERE username = ?';
const CreateUser = 'INSERT INTO UserTable(username, pass, roles, createdDate) VALUES(?,?,?,?)'
const LogIP = 'INSERT INTO IPTable(IP, createTime, lastTime) VALUES(?,?,?)'
const GetIP = 'SELECT * FROM IPTable WHERE IP = ?';
const getLast = 'SELECT lastTime FROM IPTable WHERE IP = ?';
const UpdateLast = 'UPDATE IPTable SET lastTime = ? WHERE IP = ?';

async function getUsernameInDB(db, username){
    return new Promise((resolve, reject) => {
        db.get(GetUser, [username], (err,rows) =>{
            if (err) reject(err)
            resolve(rows)
        })
    })
}

async function getIPInDB(db, IP){
    return new Promise((resolve, reject) => {
        db.get(GetIP, [IP], (err,rows) =>{
            if (err) reject(err)
            resolve(rows)
        })
    })
}

async function spamCheck(db, IP){
    const IPRow = await getIPInDB(db, IP)
    if(!IPRow){
        return 1;
    }

    return new Promise((resolve, reject ) => {
        db.get(getLast, [IP], (err, rows) => {
            if(err) reject(err);

            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            const last = new Date(rows.lastTime);

            const todayDate = today.getDate().toString() + today.getHours().toString() + today.getMinutes().toString()
            const lastDate = last.getDate().toString() + last.getHours().toString() + last.getMinutes().toString()

            if(todayDate == lastDate){
                resolve(-1)
            } else {
                resolve(1);
            }
        })
    })


}

async function logThisIP(db, IP){
    const timeElapsed = Date.now();
    const now = new Date(timeElapsed);
    const IPRow = await getIPInDB(db, IP)
    if(!IPRow){
        return new Promise((resolve, reject) => {
            db.run(LogIP, [IP,now,now], (err) => {
                if (err) reject(err)
                resolve()
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            db.run(UpdateLast, [now, IP], function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
 }



async function createNewUser(db, res, username, pass){
    const timeElapsed = Date.now();
    const now = new Date(timeElapsed);
    return new Promise((resolve, reject) => {
        db.run(CreateUser, [username,pass,'{"user":2001}',now], (err) => {
            if (err) reject(err)
            res.status(201).json({'Success': 'New User "' + username + '" Created'});
            resolve()
        })
    })
}

const handleNewUser = async (req, res) => {
    const{user,pwd,IP} = req.body;

    let checkSpam = await spamCheck(UserDB, IP)

    if(checkSpam == -1){
        return res.status(500).json({'message': 'You must wait before creating additional accounts'});
    }

    logThisIP(UserDB, IP)

    if(!user || !pwd) return res.status(400).json({'message': 'Username and Password are Required.'});
    const userCheck = await getUsernameInDB(UserDB, user); //Quary the DB for a username with the same name
    // check for duplicate usernames
    if(userCheck) return res.sendStatus(409); //Conflict
    try{
        //encrypt password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        //Add the new user to the database
        await createNewUser(UserDB, res, user, hashedPwd);

    } catch(err) {
        res.status(500).json({'message': err.message});
    }
}

module.exports = {handleNewUser};