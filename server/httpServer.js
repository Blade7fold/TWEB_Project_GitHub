require('dotenv').config();
var http = require('http');
var express = require('express');
var app = express();
var url = require('url');
var querystring = require('querystring');
var github = require('./githubServer')


let git = new github(process.env.TOKEN)

console.log('Connected');

/**
 * When this server get a /commit request, He ask to github all the commits of a user
 * return to the client the formatted answer
 */
app.get('/commit', function(req, res) {
    let q = url.parse(req.url, true)
    git.commitsOf(q.query['user'])
    .then(data => {
        try {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(data)
        } catch(err) {
            console.log(err)
        }
    })
});
  
/**
 * When this server get a /follower request, He ask to github 100 user from the given seed and keep only
 * 1) the username
 * 2) the avatar
 * 3) the number of followers
 * return to the client the formatted answer
 */
app.get('/follower', function(req, res) {
    let q = url.parse(req.url, true)
    git.followers(q.query['seed'])
    .then(data => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(data)
    }).catch(err => {
        console.log(err)
    })
});

/**
 * When this server get a /stat request, He ask to github 
 * 1) the number of commits
 * 2) the number of lines
 * 3) the number of repositories
 * return to the client the formatted answer
 */
app.get('/stat', function(req, res) {
    let q = url.parse(req.url, true)
    git.stats(q.query['seed'])
    .then(data => {
        try {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(data)
        } catch(err) {
            console.log(err)
        }
    })
});

/**
 * If the path of the request is unknow,
 * we send back to the client a 404 not found.
 */
app.get('*', function(req, res){
    res.status(404).send("pathname not found")
});

app.listen(process.env.PORT)