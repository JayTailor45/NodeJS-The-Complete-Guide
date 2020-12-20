const mongodb = require('mongodb');
const {MongoClient} = mongodb;
const {dbConfig} = require('../app.config');

let _db;

const mongoConnect = callback => {
    MongoClient.connect(dbConfig.connectionString, { useNewUrlParser: true })
        .then(client => {
            console.log('DB Connection Success!');
            _db = client.db();
            callback();
        })
        .catch(console.error);
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'DB not found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
