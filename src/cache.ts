import { Doot } from './Doot.js';

import { Cache } from 'o1js';

const cache: Cache = Cache.FileSystem('./dootCache');
const { verificationKey } = await Doot.compile({ cache });
console.log(verificationKey);
