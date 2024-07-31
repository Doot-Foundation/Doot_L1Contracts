import {
  UInt64,
  Mina,
  AccountUpdate,
  PrivateKey,
  Proof,
  JsonProof,
  verify,
} from 'o1js';

import {
  AggregationProgram10,
  AggregationProof10,
  PriceAggregationArray10,
  AggregationProgram100,
  AggregationProof100,
  PriceAggregationArray100,
  VerifyAggregationProofGenerated,
} from './Aggregation.js';

function testJsonRoundtrip<
  P extends Proof<any, any>,
  MyProof extends { fromJSON(jsonProof: JsonProof): Promise<P> }
>(MyProof: MyProof, proof: P) {
  let jsonProof = proof.toJSON();
  console.log(
    'JSON proof :',
    JSON.stringify({
      ...jsonProof,
      proof: jsonProof.proof.slice(0, 10) + '....',
    })
  );
  return MyProof.fromJSON(jsonProof);
}

function generateRandomPriceArray(
  base: bigint,
  count: number
): [UInt64[], bigint[]] {
  const result: UInt64[] = [];
  const bigResult: bigint[] = [];
  for (let i = 0; i < count; i++) {
    // Generate a random value between 0 and 100
    const randomValue = BigInt(Math.floor(Math.random() * 101));
    const positive = Math.floor(Math.random()) >= 0.5 ? true : false;

    // Add or subtract the random value from the base
    const newValue = positive ? base + randomValue : base - randomValue;
    result.push(UInt64.from(newValue));
    bigResult.push(newValue);
  }
  return [result, bigResult];
}

function generateDummy(count: number) {
  const result: UInt64[] = [];

  for (let i = 0; i < count; i++) {
    result.push(UInt64.from(1));
  }

  return result;
}

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
const { verificationKey: vk10 } = await AggregationProgram10.compile();
const { verificationKey: vk100 } = await AggregationProgram100.compile();
await VerifyAggregationProofGenerated.compile();

// DEPLOY
const VerifyContract = new VerifyAggregationProofGenerated(zkapp);
await Mina.transaction(deployer, async () => {
  AccountUpdate.fundNewAccount(deployer);
  await VerifyContract.deploy();
})
  .prove()
  .sign([deployerPK, zkappKey])
  .send();

console.log('\n===== Completed Setup. =====\n');

// START GENERATING ZKPROGRAM PROOFS

const dummy10 = generateDummy(10);
const dummyInput10: PriceAggregationArray10 = new PriceAggregationArray10({
  pricesArray: dummy10,
});
const dummy100 = generateDummy(100);
const dummyInput100: PriceAggregationArray100 = new PriceAggregationArray100({
  pricesArray: dummy100,
  count: UInt64.from(100),
});

console.log('Generated dummy input.');

// BASE CASE 10
let proof10 = await AggregationProgram10.base(dummyInput10);
proof10 satisfies AggregationProof10;
proof10 = await testJsonRoundtrip(AggregationProof10, proof10);
await verify(proof10.toJSON(), vk10);

// BASE CASE 100
let proof100 = await AggregationProgram100.base(dummyInput100);
proof100 satisfies AggregationProof100;
proof100 = await testJsonRoundtrip(AggregationProof100, proof100);
await verify(proof100.toJSON(), vk100);

console.log('\nCompleted base proof and validation.');

const [values10, bigValues10] = generateRandomPriceArray(66665248770934n, 10);
const [values100, bigValues100] = generateRandomPriceArray(
  529999487170934n,
  100
);
// const [values1000, bigValues1000] = generateRandomPriceArray(5248770934n, 1000);

const prices10: PriceAggregationArray10 = new PriceAggregationArray10({
  pricesArray: values10,
});
const prices100: PriceAggregationArray100 = new PriceAggregationArray100({
  pricesArray: values100,
  count: UInt64.from(100),
});

let expected10 =
  bigValues10.reduce(
    (accumulator: bigint, currentValue) => accumulator + currentValue,
    0n
  ) / 10n;
let expected100 =
  bigValues100.reduce(
    (accumulator: bigint, currentValue) => accumulator + currentValue,
    0n
  ) / 100n;

console.log('\nProduced prices array 10 & 100 successfully. \n');

// STEP CASE FOR PROOF 10
const start10 = performance.now();

proof10 = await AggregationProgram10.generateAggregationProof(
  prices10,
  proof10
);
console.log('Step Proof10 Generated.');
proof10 satisfies AggregationProof10;
console.log('Step Proof10 Sanity Check.');
proof10 = await testJsonRoundtrip(AggregationProof10, proof10);
const valid10 = await verify(proof10.toJSON(), vk10);
if (!valid10) {
  console.error('\nERR! VALID 10 FAILED.\n');
  process.exit(1);
}

const end10 = performance.now();

console.log(
  'Expected == Output :',
  expected10.toString() == proof10.publicOutput.toString()
);

console.log('Completed step proof and validation for proof 10.\n');

// STEP CASE FOR PROOF 100
const start100 = performance.now();

proof100 = await AggregationProgram100.generateAggregationProof(
  prices100,
  proof100
);
console.log('Step Proof100 Generated.');
proof100 satisfies AggregationProof100;
console.log('Step Proof100 Sanity Check.');
proof100 = await testJsonRoundtrip(AggregationProof100, proof100);
const valid100 = await verify(proof100.toJSON(), vk100);
if (!valid100) {
  console.error('\nERR! VALID 100 FAILED.\n');
  process.exit(1);
}

const end100 = performance.now();

console.log(
  'Expected == Output :',
  expected100.toString() == proof100.publicOutput.toString()
);

console.log('Completed step proof and validation for proof 100.\n');

console.log('Execution time for aggregating 10 :', end10 - start10, 'ms.');
console.log('Execution time for aggregating 100 :', end100 - start100, 'ms.');

// // VERIFY THE LATEST PROOF GENERATED USING THE VERIFY SMART CONTRACT
// // The call will fail if wrong proof and vk combination.
// await Mina.transaction(deployer, async () => {
//   await VerifyContract.verifyAggregationProof10(proof);
// })
//   .prove()
//   .sign([deployerPK])
//   .send();

// console.log(
//   'Validated the proof generated by ZkProgram inside the Smart Contract.'
// );

// // expected = UInt64.from(0).toString();
// // proof = await AggregationProgram10.reset(dummyInput, proof);
// // console.log('Reset Proof Generated.');
// // proof satisfies AggregationProof10;
// // console.log('Reset Proof Sanity Check.');
// // proof = await testJsonRoundtrip(AggregationProof10, proof);
// // await verify(proof.toJSON(), verificationKey);

// // console.log('Expected Output :', expected == proof.publicOutput.toString());

console.log('\n============== Completed Successfully ==============\n');
