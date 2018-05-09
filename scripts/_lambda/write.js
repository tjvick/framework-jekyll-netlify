const { appendSheetData } = require('./../_util/appendSheetData');
const { getJwtClient } = require('./../_util/getJwtClient');

let testForm = {
  date: '05/30/2018',
  startTime: '5:00 PM',
  endTime: '9:00 PM',
  location: 'write test',
  headCount: '10-20',
  description: 'Graduation party for my son.'
}

function transformData(data) {
  let form = {
    date: data.eventDate,
    startTime: data.startTime,
    endTime: data.endTime,
    headCount: data.nEaters,
    location: data.email,
    description: 'test',
  }

  let body = {
    values: [[
      form.date,
      form.startTime,
      form.endTime,
      form.location,
      form.headCount,
      form.description,
    ]]
  }

  return body;
}

function read(event, context, callback) {
  let data = JSON.parse(event.body);

  let body = transformData(data);

  const jwtClient = getJwtClient({
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY,
  });

  const headers = {
    "Access-Control-Allow-Origin" : "http://localhost:8080",
  }

  appendSheetData({
    jwtClient: jwtClient,
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'Sheet1',
    body: body,
  }).then((result) => {
    console.log('Data from Google Sheets after Write:');
    console.log(result);
    callback(null, {
      statusCode: 200,
      headers,
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