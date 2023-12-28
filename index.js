const express = require('express');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const serverless = require('serverless-http');
const router = express.Router();

const PORT = 8080;

//const APP_ID = process.env.APP_ID;
//const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
const APP_ID = "8463eead45f34bca8797b7ca87c8a256";
const APP_CERTIFICATE = "5dfe91e9c4c44aa488b5f7325db325a1";

const app = express();

const nocache = (req, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const generateAccessToken = (req, resp) => {
  // set response header
  resp.header('Acess-Control-Allow-Origin', '*');
  // get channel name
  const channelName = req.query.channelName;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  // get uid 
  let uid = req.query.uid;
  if(!uid || uid == '') {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({ 'token': token });
}

//app.get('/access_token', nocache, generateAccessToken);
router.get('/access_token',generateAccessToken);
app.use('/.netlify/functions/app',router);

/*app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});*/

module.exports.handler=serverless(app);