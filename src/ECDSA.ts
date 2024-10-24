import {
  ZkProgram,
  Crypto,
  createEcdsaV2,
  createForeignCurveV2,
  Bool,
  Bytes,
} from 'o1js';

export {
  keccakAndEcdsa,
  ecdsa,
  Secp256k1,
  Ecdsa,
  Bytes32,
  ecdsaEthers,
  keccakAndEcdsaProof,
  ecdsaEthersProof,
  ecdsaProof,
};

class Secp256k1 extends createForeignCurveV2(Crypto.CurveParams.Secp256k1) {}
class Scalar extends Secp256k1.Scalar {}
class Ecdsa extends createEcdsaV2(Secp256k1) {}
class Bytes32 extends Bytes(32) {}

const keccakAndEcdsa = ZkProgram({
  name: 'ecdsa',
  publicInput: Bytes32,
  publicOutput: Bool,

  methods: {
    verifyEcdsa: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1) {
        return signature.verifyV2(message, publicKey);
      },
    },
  },
});

const ecdsa = ZkProgram({
  name: 'ecdsa-only',
  publicInput: Scalar,
  publicOutput: Bool,

  methods: {
    verifySignedHash: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Scalar, signature: Ecdsa, publicKey: Secp256k1) {
        return signature.verifySignedHashV2(message, publicKey);
      },
    },
  },
});

const ecdsaEthers = ZkProgram({
  name: 'ecdsa-ethers',
  publicInput: Bytes32,
  publicOutput: Bool,

  methods: {
    verifyEthers: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1) {
        return signature.verifyEthers(message, publicKey);
      },
    },
  },
});
class keccakAndEcdsaProof extends ZkProgram.Proof(keccakAndEcdsa) {}
class ecdsaProof extends ZkProgram.Proof(ecdsa) {}
class ecdsaEthersProof extends ZkProgram.Proof(ecdsaEthers) {}
