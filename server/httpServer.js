var http = require('http');
var url = require('url');
var querystring = require('querystring');
var github = require('./githubServer')
require('dotenv').config();

let git = new github(process.env.TOKEN)

//git.usernames(200).then(result => console.log(result))
git.stats(200).then(result => console.log(result))

http.createServer(function (req, res) {
    let q = url.parse(req.url, true)

    if (q.pathname == "/commit") {
        git.commitsOf(q.query['user'])
        .then(data => {
            try {
                res.write(data.toString())
                res.end()
            } catch(err) {
                console.log(err)
            }
        })
    } else if (q.pathname == "/follower") {
        git.followers(q.query['seed'])
        .then(data => {
            try {
                res.write(data.toString())
                res.end()
            } catch(err) {
                console.log(err)
            }
        })
    } else if (q.pathname == "/stat") {
        git.stats(q.query['seed'])
        .then(data => {
            try {
                res.write(data.toString())
                res.end()
            } catch(err) {
                console.log(err)
            }
        })
    } else {
        res.write("pathname not found")
    }
}).listen(8080);