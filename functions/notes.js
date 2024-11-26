const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'NotesTable';

module.exports.getNotes = async () => {
    console.log('Get Notes triggered');
    try {
      const params = {
        TableName: TABLE_NAME,
      };
  
      const result = await dynamoDb.scan(params).promise();
  
      // If no notes
      if (!result.Items || result.Items.length === 0) {
        return {
          statusCode: 200,
          body: JSON.stringify([]), 
        };
      }
  
      // If notes exists 
      return {
        statusCode: 200,
        body: JSON.stringify(result.Items),
      };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
      };
    }
  };

module.exports.addNote = async (event) => {
  const { title, content } = JSON.parse(event.body);

  if (!title || !content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Title and content are required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: new Date().toISOString(), // ID with date
      title,
      content,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created successfully' }),
    };
  } catch (error) {
    console.error('Error adding note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to add note' }),
    };
  }
};

module.exports.updateNote = async (event) => {
  const { id, title, content } = JSON.parse(event.body);

  if (!id || !title || !content) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID, title, and content are required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set title = :title, content = :content',
    ExpressionAttributeValues: {
      ':title': title,
      ':content': content,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Error updating note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update note' }),
    };
  }
};

module.exports.deleteNote = async (event) => {
  const { id } = event.pathParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID is required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };

  try {
    await dynamoDb.delete(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Note deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to delete note' }),
    };
  }
};