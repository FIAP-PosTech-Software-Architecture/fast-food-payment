const mysql = require('mysql2/promise');

// Lambda handler for payment service
exports.handler = async (event, context) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, body } = event;
    
    // Database connection configuration from environment
    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: false,  // Desabilita SSL para evitar problemas
        authPlugins: {
            mysql_native_password: () => () => Buffer.alloc(0)
        },
        connectTimeout: 60000,  // 60 segundos
        acquireTimeout: 60000,  // 60 segundos
        timeout: 60000,         // 60 segundos
        reconnect: true
    };
    
    try {
        // Create database connection
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');
        
        let response;
        
        switch (httpMethod) {
            case 'GET':
                if (path.includes('/health') || path.includes('/test-connection')) {
                    // Test database connection without creating tables
                    response = await testDatabaseConnection(dbConfig);
                } else if (path === '/payments' || path === '/production/payments') {
                    // List all payments
                    const [payments] = await connection.execute('SELECT * FROM payments ORDER BY created_at DESC');
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Payments retrieved successfully',
                            data: payments,
                            count: payments.length
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            case 'POST':
                if (path === '/payments' || path === '/production/payments') {
                    // Process new payment
                    const paymentData = JSON.parse(body);
                    const { order_id, amount, payment_method, customer_id } = paymentData;
                    
                    const [result] = await connection.execute(
                        'INSERT INTO payments (order_id, customer_id, amount, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                        [order_id, customer_id, amount, payment_method, 'processing']
                    );
                    
                    response = {
                        statusCode: 201,
                        body: JSON.stringify({
                            message: 'Payment processed successfully',
                            payment_id: result.insertId,
                            status: 'processing'
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            case 'PUT':
                if (path.includes('/payments/') && path.includes('/status')) {
                    // Update payment status
                    const pathParts = path.split('/');
                    const paymentId = pathParts[pathParts.indexOf('payments') + 1];
                    const { status } = JSON.parse(body);
                    
                    await connection.execute(
                        'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?',
                        [status, paymentId]
                    );
                    
                    response = {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Payment status updated successfully',
                            payment_id: paymentId,
                            new_status: status
                        })
                    };
                } else {
                    response = {
                        statusCode: 404,
                        body: JSON.stringify({ message: 'Endpoint not found' })
                    };
                }
                break;
                
            default:
                response = {
                    statusCode: 405,
                    body: JSON.stringify({ message: 'Method not allowed' })
                };
        }
        
        await connection.end();
        
        return {
            ...response,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            }
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};

// Function to test database connection
async function testDatabaseConnection(dbConfig) {
    try {
        console.log('Testing database connection...');
        console.log('Config:', {
            host: dbConfig.host,
            database: dbConfig.database,
            port: dbConfig.port,
            user: dbConfig.user
        });
        
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected successfully');

        // Simple test query
        const [rows] = await connection.execute('SELECT 1 as test, NOW() as timestamp, DATABASE() as db_name');
        
        await connection.end();
        console.log('✅ Connection closed successfully');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'success',
                message: 'Database connection successful',
                service: 'fast-food-payment',
                connection_info: {
                    host: dbConfig.host,
                    database: dbConfig.database,
                    port: dbConfig.port,
                    user: dbConfig.user
                },
                test_result: rows[0],
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'error',
                message: 'Database connection failed',
                service: 'fast-food-payment',
                error: error.message,
                connection_info: {
                    host: dbConfig.host,
                    database: dbConfig.database,
                    port: dbConfig.port,
                    user: dbConfig.user
                },
                timestamp: new Date().toISOString()
            })
        };
    }
}