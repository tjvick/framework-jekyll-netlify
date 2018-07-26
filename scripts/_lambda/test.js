function test(event, context, callback) {
  console.log('event.body');

  const headers = {
    'Access-Control-Allow-Origin': '*',
  };

  const okay = true;
  const response = {
    'message': 'Successful lambda test!'
  }

  if (okay) {
    callback(null,
    {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    })
  } else {
    callback(new Error('Failed lambda test'), {
      statusCode: 500,
      headers,
      body: 'not sure if this does anything',
    })
  }
}

exports.handler = test;
