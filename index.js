const express = require('express');
const app = express();
const readFilePromise = require('fs-readfile-promise');

const prodd = require('./out_json/res.json');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/res.json', function (req, res) {
    res.send(prodd);
});

app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});