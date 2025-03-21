const bcrypt = require('bcrypt');
const sql = require('sqlite3').verbose();
let UserDB = new sql.Database('user.db', sql.OPEN_READWRITE, (err) =>{
	if(err) return console.error(err.message);
})

const DELUSER = "DELETE FROM UserTable WHERE username = ?"
const CHANGEPASS = 'UPDATE UserTable SET pass = ? WHERE username = ?';

const deleteUsers = async (req, res) => {
    const{usernames} = req.body;
    if(!usernames) return res.status(400).json({'message': 'A list of Usernames is Required'});

    usernames.forEach(name => {
        UserDB.all(DELUSER, [name], (err, rows) => {
            if (err) res.status(500).json({'ERROR': 'Some kind of Issue'});
            
        }); 
    });
    res.status(201).json({'Success': 'Check Done'});
}

const updatePass = async (req, res) => {
    const{username, pass} = req.body;
    if(!username) return res.status(400).json({'message': 'A username is required!'});
    if(!pass) return res.status(400).json({'message': 'A password is required!'});

    const hashedPwd = await bcrypt.hash(pass, 10);

    UserDB.run(CHANGEPASS, [hashedPwd, username], (err, rows) => {
        if (err) res.status(500).json({'ERROR': 'Failed to set Password'});
    })

    res.status(201).json({'Success': 'Check Done'});
}

module.exports = { deleteUsers, updatePass };