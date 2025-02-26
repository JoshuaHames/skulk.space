const bcrypt = require('bcrypt')
const sql = require('sqlite3').verbose();

let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) =>{
	if(err) return console.error(err.message);
})

const GetUser = 'SELECT * FROM UserTable WHERE username = ?';

async function getUsernameInDB(db, username){
    return new Promise((resolve, reject) => {
        db.get(GetUser, [username], (err,rows) =>{
            if (err) reject(err)
            resolve(rows)
        })
    })
}

const quarryUser = async (req, res) => {
    const{user} = req.body;
    if(!user) return res.status(400).json({'message': 'A Username is Required'});
    
    const userCheck = await getUsernameInDB(UserDB, user); //Quary the DB for a username with the same name

    // check for duplicate usernames
    if(userCheck) return res.sendStatus(409); //Conflict

    res.status(201).json({'Success': 'Username Avalaible'});
}

const quarryUserDetails = async (req, res) => {
    const user  = req.body.username;
    console.log(user)
    if(!user) return res.status(400).json({'message': 'A Username is Required'});
    
    const userCheck = await getUsernameInDB(UserDB, user); //Quary the DB for a username with the same name

    // check for duplicate usernames
    if(!userCheck) return res.sendStatus(409); //Conflict

    let details = {
        "username": userCheck.username,
        "roles":userCheck.roles,
        "createdDate": userCheck.createdDate,
        "lastLogin": userCheck.lastLogin
    }
    res.json(details);
}

module.exports = {quarryUser, quarryUserDetails};