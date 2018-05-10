var uuidv1 = require('uuid/v1');
var request = require('request');

function buildPostBody() {
  var orderId = '0000';

  var body = {
    "redirect_url": "http://localhost:8080",
    "idempotency_key": uuidv1(),
    "ask_for_shipping_address": false,
    "merchant_support_email": "support@tjvick.com",

    "order": {
      "reference_id": `${orderId}`,
      "line_items": [
        // List each item in the order as an individual line item
        {
          "name": "Service Name",
          "quantity": "1",
          "base_price_money": {
            "amount": 500,
            "currency": "USD"
          },
        },
      ]
    },
  }

  return body
}

function sendPostRequest(body, succeedCallback, failCallBack) {
  var locationId = process.env.SQUARE_LOCATION_ID;
  var accessToken = process.env.SQUARE_ACCESS_TOKEN;
  var checkoutURL = `https://connect.squareup.com/v2/locations/${locationId}/checkouts`;


  var headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

  request({
    method: 'POST',
    uri: checkoutURL,
    headers: headers,
    body: body,
    json: true,
  }, function(error, response, body) {
    if (error != null) {
      failCallback(error)
    } else if (body.errors != null) {
      failCallBack(body.errors);
    } else if (body.checkout) {
      succeedCallback(body.checkout)
    }
  })

  return;
}


function handler(event, context, callback) {
  // body = buildPostBody();
  // response = sendPostRequest(body);
  // logCheckoutData(response);
  // getCheckoutUrl(response);
  var body = buildPostBody();

  const headers = {
    "Access-Control-Allow-Origin" : "http://localhost:8080",
  }

  function failCallBack(err) {
    console.log('ERRORS:');
    console.log(err);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        code: 500,
        msg: 'Checkout API Request Error',
      }),
    })
  }

  function writeCheckoutData(checkout) {
    console.log('FAKE WRITING CHECKOUT DATA');
  }

  function succeedCallback(checkout) {
    console.log('CHECKOUT:');
    console.log(checkout);
    writeCheckoutData(checkout);

    callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify(checkout),
    })
  }

  sendPostRequest(body, succeedCallback, failCallBack)
}

exports.handler = handler;