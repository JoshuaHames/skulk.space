const bcrypt = require('bcrypt')
const sql = require('sqlite3').verbose();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) =>{
	if(err) return console.error(err.message);
})

UserDB.run("CREATE TABLE IF NOT EXISTS UserTable(username TEXT PRIMARY KEY COLLATE NOCASE, pass TEXT, refreshToken TEXT, roles TEXT)");
const GetUser = 'SELECT * FROM UserTable WHERE username = ?';
const CreateUser = 'INSERT INTO UserTable(username, pass, roles) VALUES(?,?,?)'

async function getUsernameInDB(db, username){
    return new Promise((resolve, reject) => {
        db.get(GetUser, [username], (err,rows) =>{
            if (err) reject(err)
            resolve(rows)
        })
    })
}

async function createNewUser(db, res, username, pass){
    return new Promise((resolve, reject) => {
        db.run(CreateUser, [username,pass,'{"user":2001}'], (err) => {
            if (err) reject(err)
            res.status(201).json({'Success': 'New User "' + username + '" Created'});
            resolve()
        })
    })
}

const handleNewUser = async (req, res) => {
    const{user,pwd} = req.body;
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