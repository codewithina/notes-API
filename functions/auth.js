import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = 'UsersTable';

const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6; 
};

export const signup = async (event) => {
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email and password are required' }),
    };
  }

  if (!validateEmail(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email format' }),
    };
  }

  if (!validatePassword(password)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Password must be at least 6 characters long' }),
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const params = {
    TableName: USERS_TABLE,
    Item: {
      email,
      passwordHash: hashedPassword,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created successfully' }),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create user', error: error.message }),
    };
  }
};

export const login = async (event) => {
  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email and password are required' }),
    };
  }

  if (!validateEmail(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email format' }),
    };
  }

  const params = {
    TableName: USERS_TABLE,
    Key: { email },
  };

  try {
    const result = await dynamoDb.get(params).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
      };
    }

    const isValidPassword = await bcrypt.compare(password, result.Item.passwordHash);

    if (!isValidPassword) {
      return {
        statusCode: 401, 
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to log in', error: error.message }),
    };
  }
};
