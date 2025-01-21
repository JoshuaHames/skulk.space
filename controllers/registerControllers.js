const usersDB = {
    users: require('../model/users.json'),
    setUsers: function(data) {this.users = data}
}

const fsPromisis = require('fs').promises;
const path = require('path')
const bcrypt = require('bcrypt')

const handleNewUser = async (req, res) => {
    const{user,pwd} = req.body;
    if(!user || !pwd) return res.status(400).json({'message': 'Username and Password are Required.'});
    // check for duplicate usernames
    const duplicate = usersDB.users.find(person => person.username === user);
    if(duplicate) return res.sendStatus(409); //Conflict
    try{
        //encrypt password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        //Using JSON as testing, replace with DB later
        const newUser = {"username": user, "password": hashedPwd}
        usersDB.setUsers([...usersDB.users, newUser]);
        await fsPromisis.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );
        //remove prints later
        console.log(usersDB.users)
        res.status(201).json({'Success': 'New User ${user} Created'});
    } catch(err) {
        res.status(500).json({'message': err.message});
    }
}

module.exports = {handleNewUser};