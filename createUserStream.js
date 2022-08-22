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

};


