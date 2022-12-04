

const express = require('express');
const app = express(); 
const port = process.env.PORT || 5000; 

const exec = require('child_process').exec

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// create a GET route
app.get('/express_backend', (req, res) => { 
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

//
app.get('/bananas', (req, res) => {
    const child = exec('X:\Code\Projects\Baja\Better-Data-Viewer\storage\csv\CSVReader.class', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            res.send({error: err, status: 500, errorOutput: stderr})
            return
        }
        // it is important to have json structure in your output or you need to create a logic which parse the output
        res.send(stdout)
      })

});

app.get('/*', (req, res) => {
    res.send({ express: '404' });
});