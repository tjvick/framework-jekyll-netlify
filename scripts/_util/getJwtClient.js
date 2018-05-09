const { google } = require('googleapis');


function getJwtClient(options) {

  let jwtClient = new google.auth.JWT(
    options.client_email,
    null,
    options.private_key,
    ['https://www.googleapis.com/auth/spreadsheets',
     'https://www.googleapis.com/auth/calendar']
  );

  //authenticate request
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("Successfully connected!");
    }
  });

  return jwtClient;
};

module.exports = {
  getJwtClient
}