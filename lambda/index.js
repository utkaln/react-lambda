const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

// Add following code on line no 5: const tableName = process.env.DYNAMODB_TABLE_NAME || 'books_info_table';


exports.handler = async (event, context) => {
    
    // console.log('Received event:', JSON.stringify(event, null, 2));

    const { body, success } = await processDataTable(event);

    return {
        body, 
        success
    };
};

const processDataTable = async (event) => {
    let body;
    let success = false;
    

    let queryParams = {
      "TableName" : tableName
    };

    const { httpReqMethod, authorName, bookName, publishedDate, ratings } = getBooksTableData(event);
    
    try {
        
        switch (httpReqMethod) {
            case 'DELETE':
                
                //insert the delete code
                let delKeyData = {"author": authorName, "bookName": bookName};
                queryParams = { ...queryParams, "Key": delKeyData };

                body = await dynamo.delete( queryParams ).promise();
                break;

            case 'GET':
                //insert the read code
                body = await dynamo.scan( queryParams ).promise();
                break;

            case 'POST':
                
                // insert the create code
                let bookItems = {"author": authorName, "bookName": bookName };

                if( publishedDate ){
                    bookItems = { ...bookItems, "publishedDate": publishedDate };
                }

                if( ratings ){
                    bookItems = { ...bookItems, "ratings": ratings };
                }
                queryParams = { ...queryParams, "Item": bookItems };

                body = await dynamo.put(queryParams).promise();
                break;

            case 'PUT':
                
                //insert the edit code
                let keyData = {"author": authorName, "bookName": bookName};
                queryParams = { 
                  ...queryParams, 
                  "Key": keyData,
                  UpdateExpression: 'set publishedDate = :publishedDate, ratings = :ratings',
                  ExpressionAttributeValues: { ':publishedDate': publishedDate, ':ratings' :ratings }
                };
                
                body = await dynamo.update(queryParams).promise();
                break;

            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
        success = true;

    } catch (err) {
        success = false;
    } finally {}

    return { body, success };
}

const getBooksTableData = (event) => {
    
    let authorName = "";
    let bookName = "";
    let publishedDate = null;
    let ratings = null;
    let httpReqMethod = "";
    
    if(event.httpReqMethod){
      httpReqMethod = event.httpReqMethod;

        if( event.author ){
            authorName = event.author;
        }

        if( event.bookName ){
            bookName = event.bookName;
        }

        if( event.publishedDate ){
            publishedDate =  event.publishedDate;
        } 

        if( event.publishedDate ){
            ratings =  event.ratings;
        } 
    }
   
    return { httpReqMethod, authorName, bookName, publishedDate, ratings};
}
