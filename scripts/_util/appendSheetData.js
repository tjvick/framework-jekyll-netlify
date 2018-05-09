const { google } = require('googleapis');
let sheets = google.sheets('v4');

function appendSheetData(options) {

  //Google Sheets API
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.append({
      auth: options.jwtClient,
      spreadsheetId: options.spreadsheetId,
      range: options.range,
      valueInputOption: 'USER_ENTERED',
      resource: options.body,
    }, function(err, response) {
      if (err) {
        reject(err);
      } else {
        resolve(response.data);
      }
    })
  })
}

module.exports = {
  appendSheetData
}