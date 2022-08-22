'use strict';

const AWS = require('aws-sdk');

const Ajv = require('ajv');

const ajv = new Ajv();

const requestSchema = require('./schema/createStreamRequestSchema.json');

let dynamoOptions = {};

if (process.env.IS_OFFLINE ) {
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

exports.handler = async (event) => {

  try {

    const body = JSON.parse(event.body);

    const valid = ajv.validate(requestSchema, body);

    if (!valid) { 
      return response(400, ajv.errorsText());
    }

    const userId = body.userId;

    const userStream = await getUserStream(userId);

    if (!userStream) {

      await createNewUserStream(userId);

      return response(201,
        {
          userId: userId,
          totalStreams: 1
        });

    }

    if (userStream.totalStreams >= 3) {

      const message = `User ${userId} has reached the maximum number of streams.`;

      return response(400, message);

    }

    const updatedUserStream = await addStream(userId, userStream.totalStreams + 1);

    return response(200, {
      userId: userId,
      totalStreams: updatedUserStream.Attributes.totalStreams
    });


  } catch (error) {

    console.log('Error: ', JSON.stringify(error, null, 2));

    return response(
      error.statusCode ? error.statusCode : 500,
      {
        error: error.name ? error.name : 'Exception',
        message: error.message ? error.message : 'Unknown error'
      })

  }

};


const getUserStream = async (userId) => {

  try {

    const params = {
      TableName: process.env.USER_STREAMS_TABLE,
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

const addStream = async (userId, totalStreams) => {
  
  try {

    const params = {
      TableName: process.env.USER_STREAMS_TABLE,
      Key: {
        userId: userId
      },
      UpdateExpression: "set totalStreams = :totalStreams",
      ExpressionAttributeValues: {
        ":totalStreams": totalStreams,
      },
      ReturnValues: "UPDATED_NEW",
    };

    const updateResults = await dynamoDB.update(params).promise();

    return updateResults;

  } catch (error) {

    console.log('Error adding stream: ', JSON.stringify(error, null, 2));

    throw error;

  }
}


