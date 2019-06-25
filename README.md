# updateDynamo

This tool can be used to recursivly update AWS Dynamo table. Add UpdateExpression in [app.js line 33](https://github.com/krisunni/massUpdateDynamo/blob/master/app.js#L33)
```
UpdateExpression: "",
        ExpressionAttributeValues: {
        },
        ReturnValues: "UPDATED_NEW"
```

To run updateDynamo
1. `npm install`
2. update `config.json`
3. run `node run.js`
4. All info logs will go to `info.log` and errors to `error.log`
    ````
    
      "profile": // This is the AWS profile
      "tableName": Table you want to scan
      "startID":Start key to scan
      "endID": End key to scan
      "limit": Total number of records per scan.
      
 

To update `table Name` with postfix `dev` execute `node run.js`
This tool will run scans and use last key continue paginate.

To run the test, install dev dependencies 
1. npm install --dev
2. npm test
