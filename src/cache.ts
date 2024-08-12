import { Doot, offchainState } from './Doot.js';
import { Cache, PrivateKey } from 'o1js';

// Uploads the cached files to the set folder.
const cache: Cache = Cache.FileSystem('./doot_cache');

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let dootZkApp = new Doot(zkappAddress);
offchainState.setContractInstance(dootZkApp);

await offchainState.compile();
await Doot.compile({ cache });
