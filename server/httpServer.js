var http = require('http');
var url = require('url');
var querystring = require('querystring');
var github = require('./githubServer')

let git = new github('9c5550ab04f6316be44a195761a69b475753ec1a')

http.createServer(function (req, res) {
    let q = url.parse(req.url, true)

    if (q.pathname == "/commit") {
        git.commitsOf(q.query['user'])
        .then(data => {
            console.log(data.toString())
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
            console.log(data.toString())
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
            console.log(data.toString())
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