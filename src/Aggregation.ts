import {
  Field,
  Provable,
  Struct,
  UInt64,
  ZkProgram,
  SelfProof,
  Proof,
  state,
  verify,
  SmartContract,
  method,
  VerificationKey,
  assert,
  State,
} from 'o1js';

export class VerificationProof extends Proof<
  PriceAggregationArray,
  PriceAggregationResult
> {}

export class VerifyAggregationProof extends SmartContract {
  @state(Field) AggregationProgramVKHash = State<Field>();

  init() {
    super.init();
  }

  @method async setVKHash(hash: Field) {
    this.AggregationProgramVKHash.getAndRequireEquals();

    this.AggregationProgramVKHash.set(hash);
  }

  @method async verifyAggregationProof(
    proof: VerificationProof,
    vk: VerificationKey
  ) {
    assert(vk.hash == this.AggregationProgramVKHash.get());

    const results = await verify(proof, vk);
    assert(results);
  }
}

export class PriceAggregationArray extends Struct({
  pricesArray: Provable.Array(UInt64, 10),
}) {}

export class PriceAggregationResult extends Struct({
  aggregationResultPrice: UInt64,
  timestamp: Field,
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
          timestamp: Field.from(0),
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

        const results: PriceAggregationResult = new PriceAggregationResult({
          aggregationResultPrice: currentSum.div(10),
          timestamp: Field.from(Date.now()),
        });

        return results;
      },
    },
  },
});
