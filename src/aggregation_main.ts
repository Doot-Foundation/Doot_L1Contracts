import { VerificationKey, UInt64, Mina, AccountUpdate, PrivateKey } from 'o1js';

import {
  AggregationProgram,
  VerifyAggregationProof,
  PriceAggregationArray,
  VerificationProof,
} from './Aggregation.js';

// SETUP LOCAL
const doProofs = false;
let Local = await Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// SETUP ACCOUNTS
const deployerPK = Local.testAccounts[0].key;
const deployer = deployerPK.toPublicKey();
const zkappKey = PrivateKey.random();
const zkapp = zkappKey.toPublicKey();

// COMPILE
const { verificationKey } = await AggregationProgram.compile();
await VerifyAggregationProof.compile();

// DEPLOY
const VerifyContract = new VerifyAggregationProof(zkapp);
await Mina.transaction(deployer, async () => {
  AccountUpdate.fundNewAccount(deployer);
  await VerifyContract.deploy();
})
  .prove()
  .sign([deployerPK, zkappKey])
  .send();

// GET THE VK TO BE USED AS STATE IN VERIFY CONTRACT
const { data, hash } = verificationKey;

// SET THE ZKPROGRAM HASH AS STATE ON THE VERIFY SMART CONTRACT
await Mina.transaction(deployer, async () => {
  await VerifyContract.setVKHash(hash);
})
  .prove()
  .sign([deployerPK])
  .send();

// START GENERATION ZKPROGRAM PROOFS
const dummyInput = new PriceAggregationArray({
  pricesArray: [],
});

// BASE CASE
const proof = await AggregationProgram.base(dummyInput);
proof satisfies VerificationProof;
proof.verify();

let minaPrice = UInt64.from(5248770935);
let bitcoinPrice = UInt64.from(615439169547040);
let ethereumPrice = UInt64.from(34421115510507);
let solanaPrice = UInt64.from(1481398311039);
let chainlinkPrice = UInt64.from(143095980879);
let cardanoPrice = UInt64.from(3907233838);
let avalanchePrice = UInt64.from(278604715977);
let ripplePrice = UInt64.from(4749419511);
let polygonPrice = UInt64.from(5645415935);
let dogePrice = UInt64.from(1261024335);

const prices: PriceAggregationArray = new PriceAggregationArray({
  pricesArray: [
    minaPrice,
    bitcoinPrice,
    ethereumPrice,
    solanaPrice,
    chainlinkPrice,
    cardanoPrice,
    avalanchePrice,
    ripplePrice,
    polygonPrice,
    dogePrice,
  ],
});

// STEP CASE
const proof_update = await AggregationProgram.generateAggregationProof(
  prices,
  proof
);
proof_update satisfies VerificationProof;
proof_update.verify();

const vkAggeregraionProgram = new VerificationKey({
  data: data,
  hash: hash,
});

// VERIFY THE LATEST PROOF GENERATED USING THE VERIFY SMART CONTRACT
// The call will fail if wrong proof and vk combination.
await Mina.transaction(deployer, async () => {
  await VerifyContract.verifyAggregationProof(
    proof_update,
    vkAggeregraionProgram
  );
})
  .prove()
  .sign([deployerPK])
  .send();

console.log('Completed Successfully.');
