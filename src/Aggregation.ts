import {
  Field,
  Provable,
  Struct,
  UInt64,
  ZkProgram,
  SelfProof,
  SmartContract,
  method,
} from 'o1js';

export class PriceAggregationArray extends Struct({
  pricesArray: Provable.Array(UInt64, 10),
}) {}

export class PriceAggregationResult extends Struct({
  aggregationResultPrice: UInt64,
  nonce: Field,
}) {}

export const AggregationProgram = ZkProgram({
  name: 'doot-prices-aggregation-program',
  publicInput: PriceAggregationArray,
  publicOutput: PriceAggregationResult,

  methods: {
    base: {
      privateInputs: [],

      async method(publicInput: PriceAggregationArray) {
        return new PriceAggregationResult({
          aggregationResultPrice: UInt64.from(0),
          nonce: Field.from(0),
        });
      },
    },
    generateAggregationProof: {
      privateInputs: [SelfProof],

      async method(
        publicInput: PriceAggregationArray,
        privateInput: SelfProof<PriceAggregationArray, PriceAggregationResult>
      ) {
        privateInput.verify();

        let currentSum = UInt64.from(0);
        currentSum.add(publicInput.pricesArray[0]);
        currentSum.add(publicInput.pricesArray[1]);
        currentSum.add(publicInput.pricesArray[2]);
        currentSum.add(publicInput.pricesArray[3]);
        currentSum.add(publicInput.pricesArray[4]);
        currentSum.add(publicInput.pricesArray[5]);
        currentSum.add(publicInput.pricesArray[6]);
        currentSum.add(publicInput.pricesArray[7]);
        currentSum.add(publicInput.pricesArray[8]);
        currentSum.add(publicInput.pricesArray[9]);

        privateInput.publicOutput.aggregationResultPrice = currentSum.div(10);
        privateInput.publicOutput.nonce =
          privateInput.publicOutput.nonce.add(1);
        return privateInput.publicOutput;
      },
    },
  },
});

export class AggregationProof extends ZkProgram.Proof(AggregationProgram) {}

export class VerifyAggregationProofGenerated extends SmartContract {
  init() {
    super.init();
  }

  @method async verifyAggregationProof(proof: AggregationProof) {
    proof.verify();
  }
}
