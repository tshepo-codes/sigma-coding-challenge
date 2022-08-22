'use strict';

const AWS = require('aws-sdk');

let dynamoOptions = {};

if (process.env.IS_OFFLINE) {

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

        const userId = body.userId;

        const userStream = await getUserStream(userId);

        if (!userStream) {

            const message = `User ${userId} does not exist.`;

            return response(400, message);

        }

        if (userStream.totalStreams >= 1) {

            const updatedUserStream = await removeStream(userId, userStream.totalStreams - 1);

            return response(200, {
                userId: userId,
                totalStreams: updatedUserStream.Attributes.totalStreams
            });

        }

        const message = `User ${userId} has no streams.`;

        return response(400, message);

    } catch (error) {

        console.log('Error: ', JSON.stringify(error, null, 2));

        return response(
            error.statusCode ? error.statusCode : 500,
            {
                error: error.name ? error.name : 'Exception',
                message: error.message ? error.message : 'Unknown error'
            })

    }

}


const getUserStream = async (userId) => {

    try {
        
        const params = {
            TableName: process.env.USER_STREAMS_TABLE,
            Key: {
                userId: userId,
            },
            Limit: 1
        };
    
        const userStream = await dynamoDB.get(params).promise();
    
        return userStream.Item;

    } catch (error) {

        console.log('Error getting user stream: ', JSON.stringify(error, null, 2));

        throw error;

    }

}


const removeStream = async (userId, totalStreams) => {

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

        console.log('Error removing stream: ', JSON.stringify(error, null, 2));

        throw error;

    }

}

