const { google } = require('googleapis');
let sheets = google.sheets('v4');

function getSheetData(options) {

  //Google Sheets API
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get({
      auth: options.jwtClient,
      spreadsheetId: options.spreadsheetId,
      range: options.sheetName,
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
  getSheetData
}