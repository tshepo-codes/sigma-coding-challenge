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

exports.handler = async (event) => {

    try {

        const body = JSON.parse(event.body);

        const userId = body.userId;

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
