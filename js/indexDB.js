//TODO: Create new database and database stores
const dbPromise = idb.open('restaurant-review', 1, db => {
    if (!db.objectStoreNames.contains('restaurants')) {
        db.createObjectStore('restaurants', { keyPath: 'id' });
    }
});

//TODO: Write data into IndexedDB
const writeData = (dbStore, restaurants) => {
    return dbPromise
        .then(db => {
            let tx = db.transaction(dbStore, 'readwrite');
            let store = tx.objectStore(dbStore);
            store.put(restaurants);
            return tx.complete;
        });
}

//TODO: Read data from IndexedDB
const readData = (dbStore) => {
    return dbPromise
        .then( db => {
            let tx = db.transaction(dbStore, 'readonly');
            let store = tx.objectStore(dbStore);
            return store.getAll();
        });
}