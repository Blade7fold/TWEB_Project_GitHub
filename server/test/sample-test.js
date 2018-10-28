// test/sample-test.js
require('dotenv').config();
const assert = require('assert');
var github = require('../githubServer');

let git;
beforeEach('Setting up the userList', function(){
	console.log('beforeEach');
	git = new github(process.env.TOKEN);
});

describe('githubServer.js testing', function () {
	it('commitsOf return commits of jimmyVerdasca', function () {
		git.commitsOf('jimmyVerdasca')
		.then(data => {
			//let jsonifiedData = JSON.stringify(data);
			var firstCommit = data[0];
			var secondCommit = data[1];
			assert.notEqual(firstCommit, undefined, "there is atleast one commit");
			assert.notEqual(secondCommit, undefined, "there is atleast a second commit");
		}).catch(err => {
			console.log(err); 
			assert.fail("something","nothing");
		});
	});

	it('port and token are not undefined', function () {
		assert.notEqual(process.env.TOKEN, undefined);
		assert.notEqual(process.env.PORT, undefined);
	});

	it('nbCommitsOf return 0 if the request fails', function () {
		git.nbCommitsOf('winson')
		.then(data => {
			assert.equal(data, 0, "0 commits on fail request");
		}).catch(err => {
			console.log(err); 
			assert.fail("0","somthing");
		});
	});
});