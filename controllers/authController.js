const usersDB = {
    users: require('../model/users.json'),
    setUsers: function(data) {this.users = data}
}

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken')
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path')

const handleLogin = async(req, res) => {
    const {user, pwd} = req.body;
    if(!user || !pwd) return res.status(400).json({'message': 'Username and Password are Required.'});
    
    const foundUser = usersDB.users.find(person => person.username === user);
    if(!foundUser){
        console.log("No Such User")
        return res.sendStatus(401); //Unauthorized
    } 
    //Evaluate password

    const match = await bcrypt.compare(pwd, foundUser.password);
    if(match){
        const accessToken = jwt.sign(
            { "username":foundUser.username},
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn : '30s'} //Make Longer Later, 5 to 15 min
        );
        const refreshToken = jwt.sign(
            { "username":foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn : '1d'}
        );
        // Save the refresh token for current user
        const otherUsers = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = {...foundUser, refreshToken};
        usersDB.setUsers([...otherUsers, currentUser]);
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(usersDB.users)
        );

        //Send the JWTs to the client
        res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000})
        res.json({ accessToken });
    } else {
        res.sendStatus(404); //Unauthorized
    }
}

module.exports = {handleLogin};