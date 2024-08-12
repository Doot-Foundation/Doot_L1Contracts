import {
  UInt64,
  Provable,
  Struct,
  ZkProgram,
  SelfProof,
  SmartContract,
  method,
} from 'o1js';

export class PriceAggregationArray20 extends Struct({
  pricesArray: Provable.Array(UInt64, 20),
  count: UInt64,
}) {}
export class PriceAggregationArray100 extends Struct({
  pricesArray: Provable.Array(UInt64, 100),
  count: UInt64,
}) {}

export const AggregationProgram20 = ZkProgram({
  name: 'doot-prices-aggregation-program',
  publicInput: PriceAggregationArray20,
  publicOutput: UInt64,

  methods: {
    base: {
      privateInputs: [],

      async method(publicInput: PriceAggregationArray20) {
        return UInt64.from(0);
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

export const AggregationProgram100 = ZkProgram({
  name: 'doot-prices-aggregation-program100',
  publicInput: PriceAggregationArray100,
  publicOutput: UInt64,

  methods: {
    base: {
      privateInputs: [],

      async method(publicInput: PriceAggregationArray100) {
        return UInt64.from(0);
      },
    },
    generateAggregationProof: {
      privateInputs: [SelfProof],

      async method(
        publicInput: PriceAggregationArray100,
        privateInput: SelfProof<PriceAggregationArray100, UInt64>
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
          .add(publicInput.pricesArray[20])
          .add(publicInput.pricesArray[21])
          .add(publicInput.pricesArray[22])
          .add(publicInput.pricesArray[23])
          .add(publicInput.pricesArray[24])
          .add(publicInput.pricesArray[25])
          .add(publicInput.pricesArray[26])
          .add(publicInput.pricesArray[27])
          .add(publicInput.pricesArray[28])
          .add(publicInput.pricesArray[29])
          .add(publicInput.pricesArray[30])
          .add(publicInput.pricesArray[31])
          .add(publicInput.pricesArray[32])
          .add(publicInput.pricesArray[33])
          .add(publicInput.pricesArray[34])
          .add(publicInput.pricesArray[35])
          .add(publicInput.pricesArray[36])
          .add(publicInput.pricesArray[37])
          .add(publicInput.pricesArray[38])
          .add(publicInput.pricesArray[39])
          .add(publicInput.pricesArray[40])
          .add(publicInput.pricesArray[41])
          .add(publicInput.pricesArray[42])
          .add(publicInput.pricesArray[43])
          .add(publicInput.pricesArray[44])
          .add(publicInput.pricesArray[45])
          .add(publicInput.pricesArray[46])
          .add(publicInput.pricesArray[47])
          .add(publicInput.pricesArray[48])
          .add(publicInput.pricesArray[49])
          .add(publicInput.pricesArray[50])
          .add(publicInput.pricesArray[51])
          .add(publicInput.pricesArray[52])
          .add(publicInput.pricesArray[53])
          .add(publicInput.pricesArray[54])
          .add(publicInput.pricesArray[55])
          .add(publicInput.pricesArray[56])
          .add(publicInput.pricesArray[57])
          .add(publicInput.pricesArray[58])
          .add(publicInput.pricesArray[59])
          .add(publicInput.pricesArray[60])
          .add(publicInput.pricesArray[61])
          .add(publicInput.pricesArray[62])
          .add(publicInput.pricesArray[63])
          .add(publicInput.pricesArray[64])
          .add(publicInput.pricesArray[65])
          .add(publicInput.pricesArray[66])
          .add(publicInput.pricesArray[67])
          .add(publicInput.pricesArray[68])
          .add(publicInput.pricesArray[69])
          .add(publicInput.pricesArray[70])
          .add(publicInput.pricesArray[71])
          .add(publicInput.pricesArray[72])
          .add(publicInput.pricesArray[73])
          .add(publicInput.pricesArray[74])
          .add(publicInput.pricesArray[75])
          .add(publicInput.pricesArray[76])
          .add(publicInput.pricesArray[77])
          .add(publicInput.pricesArray[78])
          .add(publicInput.pricesArray[79])
          .add(publicInput.pricesArray[80])
          .add(publicInput.pricesArray[81])
          .add(publicInput.pricesArray[82])
          .add(publicInput.pricesArray[83])
          .add(publicInput.pricesArray[84])
          .add(publicInput.pricesArray[85])
          .add(publicInput.pricesArray[86])
          .add(publicInput.pricesArray[87])
          .add(publicInput.pricesArray[88])
          .add(publicInput.pricesArray[89])
          .add(publicInput.pricesArray[90])
          .add(publicInput.pricesArray[91])
          .add(publicInput.pricesArray[92])
          .add(publicInput.pricesArray[93])
          .add(publicInput.pricesArray[94])
          .add(publicInput.pricesArray[95])
          .add(publicInput.pricesArray[96])
          .add(publicInput.pricesArray[97])
          .add(publicInput.pricesArray[98])
          .add(publicInput.pricesArray[99])
          .div(publicInput.count);
      },
    },
  },
});

export class AggregationProof20 extends ZkProgram.Proof(AggregationProgram20) {}
export class AggregationProof100 extends ZkProgram.Proof(
  AggregationProgram100
) {}

export class VerifyAggregationProofGenerated extends SmartContract {
  init() {
    super.init();
  }

  @method async verifyAggregationProof20(proof: AggregationProof20) {
    proof.verify();
  }
  @method async verifyAggregationProof100(proof: AggregationProof100) {
    proof.verify();
  }
}
