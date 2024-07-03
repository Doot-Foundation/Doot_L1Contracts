import { Doot, IpfsCID, PricesArray, offchainState } from './Doot.js';

import {
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap,
  CircuitString,
  Field,
  MerkleMapWitness,
} from 'o1js';

const doProofs = false;

let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

let oraclePK = Local.testAccounts[0].key;
let oracle = oraclePK.toPublicKey();

let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();

let minaKey = CircuitString.fromString('Mina').hash();
let bitcoinKey = CircuitString.fromString('Bitcoin').hash();
let chainlinkKey = CircuitString.fromString('Chainlink').hash();
let solanaKey = CircuitString.fromString('Solana').hash();
let ethereumKey = CircuitString.fromString('Ethereum').hash();
let cardanoKey = CircuitString.fromString('Cardano').hash();
let avalancheKey = CircuitString.fromString('Avalanche').hash();
let rippleKey = CircuitString.fromString('Ripple').hash();
let dogeKey = CircuitString.fromString('Dogecoin').hash();
let polygonKey = CircuitString.fromString('Polygon').hash();

console.log('\nKEYS ->');
console.log(minaKey.toString());
console.log(bitcoinKey.toString());
console.log(chainlinkKey.toString());
console.log(solanaKey.toString());
console.log(ethereumKey.toString());
console.log(cardanoKey.toString());
console.log(avalancheKey.toString());
console.log(rippleKey.toString());
console.log(dogeKey.toString());
console.log(polygonKey.toString());

const Map = new MerkleMap();

let minaPrice = Field.from(5248770935);
let bitcoinPrice = Field.from(615439169547040);
let ethereumPrice = Field.from(34421115510507);
let solanaPrice = Field.from(1481398311039);
let chainlinkPrice = Field.from(143095980879);
let cardanoPrice = Field.from(3907233838);
let avalanchePrice = Field.from(278604715977);
let ripplePrice = Field.from(4749419511);
let polygonPrice = Field.from(5645415935);
let dogePrice = Field.from(1261024335);

Map.set(minaKey, minaPrice);
Map.set(bitcoinKey, bitcoinPrice);
Map.set(chainlinkKey, chainlinkPrice);
Map.set(solanaKey, solanaPrice);
Map.set(ethereumKey, ethereumPrice);
Map.set(cardanoKey, cardanoPrice);
Map.set(avalancheKey, avalanchePrice);
Map.set(rippleKey, ripplePrice);
Map.set(dogeKey, dogePrice);
Map.set(polygonKey, polygonPrice);

let dootZkApp = new Doot(zkappAddress);
offchainState.setContractInstance(dootZkApp);

console.log('\nDeploying Doot...');

if (doProofs) {
  await Doot.compile();
  await offchainState.compile();
}

const deployTxn = await Mina.transaction(oracle, async () => {
  AccountUpdate.fundNewAccount(oracle);
  await dootZkApp.deploy();
});
await deployTxn.prove();
await deployTxn.sign([oraclePK, zkappKey]).send();

console.log('\nUpdating base values...');

const latestCommitment: Field = Map.getRoot();
const latestIPFSHash: IpfsCID = IpfsCID.fromString(
  'QmQy34PrqnoCBZySFAkRsC9q5BSFESGUxX6X8CQtrNhtrB'
);

const secret: Field = Field.random();
console.log(secret, secret.toString());

// let toAdd = Provable.Array(Field, 10);
let prices: PricesArray = new PricesArray({
  array: [
    minaPrice,
    bitcoinPrice,
    ethereumPrice,
    solanaPrice,
    ripplePrice,
    cardanoPrice,
    avalanchePrice,
    polygonPrice,
    chainlinkPrice,
    dogePrice,
  ],
});

// .fromValue();

await Mina.transaction(oracle, async () => {
  await dootZkApp.initBase(latestCommitment, latestIPFSHash, prices, secret);
})
  .prove()
  .sign([oraclePK])
  .send();

let proof = await offchainState.createSettlementProof();
await Mina.transaction(oracle, () => dootZkApp.settle(proof))
  .prove()
  .sign([oraclePK])
  .send();

const onChainIpfsCID = dootZkApp.ipfsCID.get();
const ipfsHash = IpfsCID.unpack(onChainIpfsCID.packed)
  .map((x) => x.toString())
  .join('');

console.log(
  `Review the latest/historical data at: https://ipfs.io/ipfs/${ipfsHash}`
);

const minaWitness: MerkleMapWitness = Map.getWitness(minaKey);
const chainlinkWitness: MerkleMapWitness = Map.getWitness(chainlinkKey);
const solanaWitness: MerkleMapWitness = Map.getWitness(solanaKey);
const ethereumWitness: MerkleMapWitness = Map.getWitness(ethereumKey);
const bitcoinWitness: MerkleMapWitness = Map.getWitness(bitcoinKey);
const avalanceWitness: MerkleMapWitness = Map.getWitness(avalancheKey);
const cardanoWitness: MerkleMapWitness = Map.getWitness(cardanoKey);
const rippleWitness: MerkleMapWitness = Map.getWitness(rippleKey);
const polygonWitness: MerkleMapWitness = Map.getWitness(polygonKey);
const dogeWitness: MerkleMapWitness = Map.getWitness(dogeKey);

const [rootMina] = minaWitness.computeRootAndKeyV2(minaPrice);
const [rootChainlink] = chainlinkWitness.computeRootAndKeyV2(chainlinkPrice);
const [rootSolana] = solanaWitness.computeRootAndKeyV2(solanaPrice);
const [rootEthereum] = ethereumWitness.computeRootAndKeyV2(ethereumPrice);
const [rootBitcoin] = bitcoinWitness.computeRootAndKeyV2(bitcoinPrice);
const [rootAvalanche] = avalanceWitness.computeRootAndKeyV2(avalanchePrice);
const [rootCardano] = cardanoWitness.computeRootAndKeyV2(cardanoPrice);
const [rootRipple] = rippleWitness.computeRootAndKeyV2(ripplePrice);
const [rootDogecoin] = dogeWitness.computeRootAndKeyV2(dogePrice);
const [rootPolygoon] = polygonWitness.computeRootAndKeyV2(polygonPrice);

console.log('\nROOTS ->');
console.log(latestCommitment.toString());
console.log(rootMina.toString());
console.log(rootChainlink.toString());
console.log(rootSolana.toString());
console.log(rootEthereum.toString());
console.log(rootBitcoin.toString());
console.log(rootAvalanche.toString());
console.log(rootCardano.toString());
console.log(rootRipple.toString());
console.log(rootDogecoin.toString());
console.log(rootPolygoon.toString());

console.log('\nVALUES ->');
console.log(Map.get(minaKey).toBigInt());
console.log(Map.get(chainlinkKey).toBigInt());
console.log(Map.get(solanaKey).toBigInt());
console.log(Map.get(ethereumKey).toBigInt());
console.log(Map.get(bitcoinKey).toBigInt());
console.log(Map.get(avalancheKey).toBigInt());
console.log(Map.get(cardanoKey).toBigInt());
console.log(Map.get(rippleKey).toBigInt());
console.log(Map.get(dogeKey).toBigInt());
console.log(Map.get(polygonKey).toBigInt());
