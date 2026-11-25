// Runs once, on the first start of an empty MongoDB volume (docker-entrypoint-initdb.d).
// Creates a least-privilege application user limited to the application database.
const dbName = process.env.MONGO_INITDB_DATABASE;
const appUser = process.env.MONGO_APP_USER;
const appPassword = process.env.MONGO_APP_PASSWORD;

if (!dbName || !appUser || !appPassword) {
  throw new Error('MONGO_INITDB_DATABASE, MONGO_APP_USER and MONGO_APP_PASSWORD are required');
}

db.getSiblingDB(dbName).createUser({
  user: appUser,
  pwd: appPassword,
  roles: [{ role: 'readWrite', db: dbName }],
});
