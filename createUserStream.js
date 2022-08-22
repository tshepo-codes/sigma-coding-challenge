'use strict';

const AWS = require('aws-sdk');

let dynamoOptions = {};

if (process.env.IS_LOCAL) {
  dynamoOptions = {
    region: "localhost",
    endpoint: "http://localhost:8000",
  };
}

const dynamoDB = new AWS.DynamoDB.DocumentClient(dynamoOptions);


exports.hello = async (event) => {

  try {

    console.log('Event: ', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body);

    const userId = body.userId;

    console.log('UserId: ', userId);
    
  } catch (error) {

    console.log('Error: ', JSON.stringify(error, null, 2));

  }

};


