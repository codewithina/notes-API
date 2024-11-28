import AWS from 'aws-sdk';
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'NotesTable';

export const getNotes = async (userId) => {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: { ':userId': userId },
  };

  try {
    const result = await dynamoDb.scan(params).promise();
    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No notes found for this user' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};

export const addNote = async (noteData) => {
  const { title, text, userId } = noteData;

  if (!title || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Title and text are required' }),
    };
  }

  const timestamp = new Date().toISOString();
  const params = {
    TableName: TABLE_NAME,
    Item: {
      id: timestamp,
      title,
      text,
      userId,
      createdAt: timestamp,
      modifiedAt: timestamp,
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

export const updateNote = async (noteData) => {
  const { id, title, text, userId } = noteData;

  if (!id || !title || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID, title, and text are required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #title = :title, #text = :text, modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#text': 'text',
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':text': text,
      ':modifiedAt': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();
    if (!result.Attributes) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }
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

export const deleteNote = async (id, userId) => {
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'ID is required' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    ConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const result = await dynamoDb.delete(params).promise();
    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Note not found' }),
      };
    }
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