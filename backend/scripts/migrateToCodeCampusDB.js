const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
    const oldUri = process.env.MONGODB_URI;
    const newUri = oldUri.replace('.mongodb.net/?', '.mongodb.net/CodeCampusDB?');

    console.log('Connecting to source (old DB)...');
    const sourceConn = await mongoose.createConnection(oldUri).asPromise();
    console.log('Source connected to database:', sourceConn.name);

    console.log('Connecting to target (CodeCampusDB)...');
    const targetConn = await mongoose.createConnection(newUri).asPromise();
    console.log('Target connected to database:', targetConn.name);

    const collections = await sourceConn.db.listCollections().toArray();
    console.log('Collections to copy:', collections.map(c => c.name));

    for (const col of collections) {
        const name = col.name;
        if (name.startsWith('system.')) continue;

        const docs = await sourceConn.db.collection(name).find({}).toArray();
        console.log('Copying ' + docs.length + ' documents for collection: ' + name);

        await targetConn.db.collection(name).deleteMany({});
        if (docs.length > 0) {
            await targetConn.db.collection(name).insertMany(docs);
        }
    }

    console.log('All collections and documents successfully migrated to CodeCampusDB!');
    await sourceConn.close();
    await targetConn.close();
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});
