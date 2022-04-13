var snowflake = require('snowflake-sdk');

// Create the connection pool instance
const connectionPool = snowflake.createPool(
    // connection options
    {
        account: 'qigjzsg-bv93326',
        username: 'rizwan19',
        password: 'Stayaway@123',
        database: 'MYDATABASE'
    },
    // pool options
    {
      max: 10, // specifies the maximum number of connections in the pool
      min: 0   // specifies the minimum number of connections in the pool
    },
   
);

connectionPool.use(async (clientConnection: any) =>
{
    // const statement = await clientConnection.execute({
    //     sqlText: 'SELECT * FROM SNOWFLAKE_SAMPLE_DATA.TPCDS_SF10TCL.CUSTOMER WHERE C_CUSTOMER_SK = 23883790;',
    //     complete: function (err: any, stmt: any , rows: any)
    //     {
    //         var stream = statement.streamRows();
    //         stream.on('data', function (row: any)
    //         {
    //             console.log(row);
    //         });
    //         stream.on('end', function (row: any)
    //         {
    //             console.log('All rows consumed');
    //         });
    //     }
    // });
    console.log("DB Connection Successful");
});

module.exports = connectionPool;
