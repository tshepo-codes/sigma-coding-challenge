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


const response = (statusCode, message) => {

  return {
    statusCode: statusCode,
    body: JSON.stringify({
      statusCode: statusCode,
      message: message
    })
  }

}

exports.hello = async (event) => {

  try {

    console.log('Event: ', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body);

    const userId = body.userId;

    console.log('UserId: ', userId);

    const userStream = await getUserStream(userId);

    console.log('UserStream: ', JSON.stringify(userStream, null, 2));


    if (!userStream) {
      // create user stream
      console.log('No user stream found, creating one');
      //return response
      return;
    }

    console.log('No user stream found, creating one');


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



// Create a new user with a default of 1 stream
const createNewUserStream = async (userId) => {
  try {
    const params = {
      TableName: process.env.USER_STREAMS_TABLE,
      Item: {
        userId: userId,
        totalStreams: 1
      }
    };

    await dynamoDB.put(params).promise();

  } catch (error) {

    console.log('Error creating new user stream: ', JSON.stringify(error, null, 2));
    
    throw error;
    
  }
}

