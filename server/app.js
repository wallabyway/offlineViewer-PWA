'use strict'
const express = require('express')
const forge = require('forge-apis')
const app = express()


if (!process.env.FORGE_URN) {
	console.log('Error - Please set environment variables and restart.');
	return;
}

// gets oauth token from Forge API
const oAuth2TwoLegged = new forge.AuthClientTwoLegged(
	process.env.FORGE_CLIENT_ID,
	process.env.FORGE_CLIENT_SECRET,
	['viewables:read'])


// The browser will ask for a fresh Access Token as a javascript file
app.get('/js/init.js', (req, res) => {
	oAuth2TwoLegged.authenticate().then( function(restoken) {
		res.send(` 
			options = {
				accessToken: "${restoken.access_token}",
				env: "AutodeskProduction"
			};
		`);
		console.log(`Sent ForgeToken: ${restoken.access_token}`);
	});
})

// use github to host your static website, rather than lambda
// app.use(express.static(__dirname + '/www'));

app.listen(3000); // <-- uncomment this line for local debugging, then type: >node app.js

module.exports = app
