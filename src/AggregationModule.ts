import {
  UInt64,
  Mina,
  verify,
  JsonProof,
  Provable,
  Struct,
  ZkProgram,
  SelfProof,
} from "o1js";

class PriceAggregationArray20 extends Struct({
  pricesArray: Provable.Array(UInt64, 20),
  count: UInt64,
}) {}

const AggregationProgram20 = ZkProgram({
  name: "doot-prices-aggregation-program",
  publicInput: PriceAggregationArray20,
  publicOutput: UInt64,

  methods: {
    base: {
      privateInputs: [],

      async method(publicInput: PriceAggregationArray20) {
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
          .add(publicInput.pricesArray[10])
          .add(publicInput.pricesArray[11])
          .add(publicInput.pricesArray[12])
          .add(publicInput.pricesArray[13])
          .add(publicInput.pricesArray[14])
          .add(publicInput.pricesArray[15])
          .add(publicInput.pricesArray[16])
          .add(publicInput.pricesArray[17])
          .add(publicInput.pricesArray[18])
          .add(publicInput.pricesArray[19])
          .div(publicInput.count);
      },
    },
    generateAggregationProof: {
      privateInputs: [SelfProof],

      async method(
        publicInput: PriceAggregationArray20,
        privateInput: SelfProof<PriceAggregationArray20, UInt64>
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
          .add(publicInput.pricesArray[10])
          .add(publicInput.pricesArray[11])
          .add(publicInput.pricesArray[12])
          .add(publicInput.pricesArray[13])
          .add(publicInput.pricesArray[14])
          .add(publicInput.pricesArray[15])
          .add(publicInput.pricesArray[16])
          .add(publicInput.pricesArray[17])
          .add(publicInput.pricesArray[18])
          .add(publicInput.pricesArray[19])
          .div(publicInput.count);
      },
    },
  },
});

class AggregationProof20 extends ZkProgram.Proof(AggregationProgram20) {}

async function generateUInt64Array(
  prices: bigint[]
): Promise<[UInt64[], UInt64]> {
  let lastValidValueIndex = prices.length;
  let UInt64Prices: UInt64[] = [];

  for (let i = prices.length - 1; i >= 0; i--)
    if (prices[i] !== 0n) {
      lastValidValueIndex = i;
      break;
    }
  const count = UInt64.from(lastValidValueIndex + 1);

  UInt64Prices = prices
    .slice(0, lastValidValueIndex + 1)
    .map((price) => UInt64.from(price));

  return [UInt64Prices, count];
}

/// AGGREGATION OF WHOLE PRICES WITHOUT PRECISION (Indirect precision of 10 by multiplying the original values by 10**10).
async function AggregationModule(
  prices: bigint[],
  lastAvailableProofStr: string,
  isBase: boolean
): Promise<[JsonProof | null, bigint]> {
  let Local = await Mina.LocalBlockchain({ proofsEnabled: false });
  Mina.setActiveInstance(Local);
  const { verificationKey: vk20 } = await AggregationProgram20.compile();

  const lastAvailableProof: JsonProof = JSON.parse(lastAvailableProofStr);
  const compatibleResults = await generateUInt64Array(prices);
  const input20: PriceAggregationArray20 = new PriceAggregationArray20({
    pricesArray: compatibleResults[0],
    count: compatibleResults[1],
  });

  if (!isBase) {
    const compatibleLastAvailableProof = await AggregationProof20.fromJSON(
      lastAvailableProof
    );
    let proof20 = await AggregationProgram20.generateAggregationProof(
      input20,
      compatibleLastAvailableProof
    );
    console.log("Step Proof20 Generated.");

    proof20 satisfies AggregationProof20;
    console.log("Step Proof20 Sanity Check.");

    const valid20 = await verify(proof20.toJSON(), vk20);
    if (!valid20) {
      console.log("\nERR! VALID 20 FAILED.\n");
      return [null, 0n];
    } else {
      return [proof20.toJSON(), proof20.publicOutput.toBigInt()];
    }
  } else {
    let proof20 = await AggregationProgram20.base(input20);
    console.log("Base Proof20 Generated.");

    proof20 satisfies AggregationProof20;
    console.log("Base Proof20 Sanity Check.");

    const valid20 = await verify(proof20.toJSON(), vk20);
    if (!valid20) {
      console.log("\nERR! VALID 20 FAILED.\n");
      return [null, 0n];
    } else {
      return [proof20.toJSON(), proof20.publicOutput.toBigInt()];
    }
  }
}

module.exports = { AggregationModule };
