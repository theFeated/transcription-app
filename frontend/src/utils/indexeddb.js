import { openDB } from 'idb';

const DB_NAME = 'TranscriptionJobs';
const DB_VERSION = 1;
const STORE_NAME = 'jobs';

export async function getDB() {
    return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
}

export async function saveJob(job) {
    const db = await getDB();
    await db.put(STORE_NAME, job);
}

export async function deleteJob(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

export async function clearJobs() {
    const db = await getDB();
    await db.clear(STORE_NAME);
}

export async function getAllJobs() {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
}
