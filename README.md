# sigma-coding-challenge
A service in Node.js that exposes an API which can be consumed from any client. This
service checks how many video streams a given user is watching and prevent a user from
watching more than 3 video streams concurrently.

## My Solution
I took a straightforward approach to this issue while keeping scalability in mind. I have decided to use AWS's serverless services (Lambda, API Gateway, and DynamoDB) to take adavantage of the automated scalability based on demand.



## Installation and deployment instructions

### Setting up the DB locally
To setup DynamoDD locally access the following link: [Deploying DynamoDb Locally](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)


Once the DynamoDB is setup locally, run the db on your computer.

Create a new table by running the following script:
`aws dynamodb create-table --attribute-definitions AttributeName=userId,AttributeType=S --table-name user-streams-management-dev --key-schema AttributeName=userId,KeyType=HASH --billing-mode PAY_PER_REQUEST  --output json --endpoint-url http://localhost:8000`

Run the following command to verify that the table has been created:
`aws dynamodb list-tables --endpoint-url http://localhost:8000`

### Building the project locally

* Clone the project to your local machine
* Run `npm install` to install dependencies
* Run `serverless offline` to run the server locally
* Use an http client to test enpoints
    * I've provided a postman collection with all the endpoints in the collections direction of this repo

### Endpoints
The solution has two http endpoints:
* Create user stream. This is used to create a new stream for the user based on the userId
    * Enpoint: http://localhost:3000/dev/streams/add
    * Method: POST
    * Sample Request body :
        ```javascript
        {
            "userId": "ab-12345"
        }
        ```
* Remove user stream. This is used to remove a stream for the user based on the userId
    * Enpoint: http://localhost:3000/dev/streams/remove
    * Method: POST
    * Sample Request body :
        ```javascript
        {
            "userId": "ab-12345"
        }
        ```

### Deploying the project to AWS
In case the service needs to be deployed to AWS


## Scalability

### Lambda
AWS Lambda provides a serverless compute service that can scale from a single request to hundreds of thousands per second. Lambda has two scaling quotas. Account consurrency quota and burst concurrency quota.

Account concurrency is the maximum concurrency in a particular Region. This is shared across all functions in an account. The default Regional concurrency quota starts at 1,000, which you can increase with a service ticket.

The burst concurrency quota provides an initial burst of traffic, between 500 and 3000 per minute, depending on the Region. This is also shared across all function in an account.

### DynamoDB
For DynamoDB I've set the billing mode to pay_per_request. This allows us to use the database on-demand and only pay for the read and write requests that we use. This allows us to automatically scale with high traffic and scale down when traffic dies down.

### API Gateway
API Gateway allows us to build services with no fixed costs and a pay-as-you-go pricing model. The service can handle any number of requests per second while making good use of system resources.



