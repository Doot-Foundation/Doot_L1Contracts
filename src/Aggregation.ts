import {
  UInt64,
  Provable,
  Struct,
  ZkProgram,
  SelfProof,
  SmartContract,
  method,
} from 'o1js';

export class PriceAggregationArray extends Struct({
  pricesArray: Provable.Array(UInt64, 10),
}) {}

export const AggregationProgram = ZkProgram({
  name: 'doot-prices-aggregation-program',
  publicInput: PriceAggregationArray,
  publicOutput: UInt64,

  methods: {
    base: {
      privateInputs: [],

      async method(publicInput: PriceAggregationArray) {
        return UInt64.from(0);
      },
    },
    generateAggregationProof: {
      privateInputs: [SelfProof],

      async method(
        publicInput: PriceAggregationArray,
        privateInput: SelfProof<PriceAggregationArray, UInt64>
      ) {
        privateInput.verify();

        return publicInput.pricesArray[0]
          .add(publicInput.pricesArray[1])
          .add(publicInput.pricesArray[2])
          .add(publicInput.pricesArray[3])
          .add(publicInput.pricesArray[4])
          .add(publicInput.pricesArray[5])
          .add(publicInput.pricesArray[6])
          .add(publicInput.pricesArray[7])
          .add(publicInput.pricesArray[8])
          .add(publicInput.pricesArray[9])
          .div(10);
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
