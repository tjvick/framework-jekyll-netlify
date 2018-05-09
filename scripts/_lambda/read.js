const { getSheetData } = require('./../_util/getSheetData');
const { getJwtClient } = require('./../_util/getJwtClient');

function read(event, context, callback) {
  const jwtClient = getJwtClient({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  });

  getSheetData({
    spreadsheetId: process.env.SPREADSHEET_ID,
    sheetName: 'Sheet1',
    jwtClient: jwtClient,
  }).then((result) => {
    console.log('Data from Google Sheets after Write:');
    console.log(result);
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(result),
    })
  }).catch((err) => {
    console.log('The API returned an error during Read: ' + err);
    callback(null, {
      statusCode: 500,
    })
  })
}

exports.handler = read;