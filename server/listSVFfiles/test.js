// server.js
const svf = require('./svf-utils.js');

const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJHYjNobDY5S21YOGpQQkJnQXJtU1RRNmdDR3Bna3VCaiIsImV4cCI6MTUzOTI3NzM0NSwic2NvcGUiOlsiZGF0YTpyZWFkIiwiZGF0YTp3cml0ZSIsImRhdGE6Y3JlYXRlIiwiYnVja2V0OnJlYWQiLCJidWNrZXQ6Y3JlYXRlIl0sImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9qd3RleHA2MCIsImp0aSI6ImF0UmtGVDRqQkxlSmtqS3BnalVib29jcUVsc3Y3TVRjM0tqbzZFMk5NNmpzR3Jab21BQVpSbktIQkRKZXBEaWEifQ.pIpmv0X5Bx_Kreno3qh24ECgK1JLmDFzk4CQBJ1z6cs";
const urn = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dnJwYXJ0eTEvcmFjX2FsbHZpZXdzMy5ydnQ=";

const demo = async function() {
    const manifest = await svf.getManifest(urn, token);
    const items = await svf.getDerivatives(manifest);
    console.log( JSON.stringify(items) );
}

demo();





