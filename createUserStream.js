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

    const userStream = await getUserStream(userId);

  } catch (error) {

    console.log('Error: ', JSON.stringify(error, null, 2));

  }

};


const getUserStream = async (userId) => {
  try {

    const params = {
      TableName: 'UserStream',
      Key: {
        userId: userId
      }
    };

    const data = await dynamoDB.get(params).promise();

    return data.Item;

  } catch (error) {

    console.log('Error getting user stream: ', JSON.stringify(error, null, 2));

    throw error;
    
  }

}


