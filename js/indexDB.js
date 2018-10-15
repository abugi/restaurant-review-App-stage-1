//Helper function for creating a database with data stores
const dbPromise = idb.open('restaurant-review', 1, db => {
    if (!db.objectStoreNames.contains('restaurants')) {
        db.createObjectStore('restaurants', { keyPath: 'id' });
    }
});

//Helper function to write data into IndexedDB
const writeData = (dbStore, restaurants) => {
    return dbPromise
        .then( db => {
            let tx = db.transaction(dbStore, 'readwrite');
            let store = tx.objectStore(dbStore);
            store.put(restaurants);
            return tx.complete;
        });
}

const readData = (dbStore) => {
    return dbPromise
        .then( db => {
            let tx = db.transaction(dbStore, 'readonly');
            let store = tx.objectStore(dbStore);
            return store.getAll();
        });
}