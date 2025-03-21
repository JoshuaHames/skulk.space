const bcrypt = require('bcrypt');
const sql = require('sqlite3').verbose();
let SplashDB = new sql.Database('splash.db', sql.OPEN_READ, (err) =>{
	if(err) return console.error(err.message);
})

const DELLINE = "DELETE FROM SplashTable WHERE id = ?"
const CHANGELINE = 'UPDATE SplashTable SET line = ? WHERE id = ?';
const ADDLINE = 'INSERT INTO SplashTable(line, credit) VALUES(?,?)'

const deleteLines = async (req, res) => {
    const{lines} = req.body;
    if(!lines) return res.status(400).json({'message': 'at least one line is required'});

    lines.forEach(line => {
        SplashDB.all(DELLINE, [line], (err, rows) => {
            if (err) res.status(500).json({'ERROR': 'Some kind of Issue'});
            
        }); 
    });
    res.status(201).json({'Success': 'Deleted Lines'});
}

const updateLine = async (req, res) => {
    const{newLine, id} = req.body;
    if(!newLine) return res.status(400).json({'message': 'A newLine is required!'});
    if(!id) return res.status(400).json({'message': 'An line must be selected!'});

    SplashDB.run(CHANGELINE, [newLine, id], (err, rows) => {
        if (err) res.status(500).json({'ERROR': 'Failed to change the line'});
    })

    res.status(201).json({'Success': 'Check Done'});
}

const addLine = async (req, res) => {
    const{newLine,credit} = req.body;
    if(!newLine) return res.status(400).json({'message': 'A newLine is required!'});

    SplashDB.run(ADDLINE, [newLine,credit], (err, rows) => {
        if (err) res.status(500).json({'ERROR': 'Failed to add line'});
    })

    res.status(201).json({'Success': 'Check Done'});
}

module.exports = { addLine, updateLine, deleteLines };