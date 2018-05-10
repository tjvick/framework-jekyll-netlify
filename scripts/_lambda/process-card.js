function processCard(event, context, callback) {
  console.log(event);

  callback(null, {
    statusCode: 200,
    body: 'testing',
  })
}

exports.handler = processCard;