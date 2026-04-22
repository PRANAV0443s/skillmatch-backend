const { MongoClient } = require('mongodb');
async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('skillmatch');
  const result = await db.collection('users').deleteMany({});
  console.log('Deleted ' + result.deletedCount + ' accounts. DB is clean!');
  await client.close();
}
main().catch(console.error);
