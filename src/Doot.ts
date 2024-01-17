import {
  SmartContract,
  Field,
  method,
  MerkleMapWitness,
  State,
  state,
  PublicKey,
  Signature,
  Poseidon,
} from 'o1js';

import { MultiPackedStringFactory } from 'o1js-pack';

export class IpfsCID extends MultiPackedStringFactory(4) {}

export class Doot extends SmartContract {
  /// @notice Merkle Map Root to make sure the values are valid.
  @state(Field) commitment = State<Field>();

  /// @notice IPFS URL of the off-chain file which holds the asset price info upto the past 2 hours.
  /// @notice The historical data and latest data is separated.
  @state(IpfsCID) ipfsCID = State<IpfsCID>();

  @state(PublicKey) oraclePublicKey = State<PublicKey>();

  @state(Field) secretToken = State<Field>();

  @method init() {
    super.init();
    this.oraclePublicKey.set(this.sender);
  }

  @method updateIndividual(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    valueToChange: Field,
    updatedCID: IpfsCID,
    secret: Field
  ) {
    const currentOracle = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(currentOracle);

    const currentSecretToken = this.secretToken.get();
    this.secretToken.assertEquals(currentSecretToken);

    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);

    const currentCID = this.ipfsCID.get();
    this.ipfsCID.assertEquals(currentCID);

    const sentSecret = Poseidon.hash([secret]);
    this.secretToken.assertEquals(sentSecret);

    const [previousCommitment, key] = keyWitness.computeRootAndKey(valueBefore);
    previousCommitment.assertEquals(currentCommitment);
    key.assertEquals(keyToChange);

    const updatedCommitment = keyWitness.computeRootAndKey(valueToChange)[0];

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedCID);
  }

  @method updateBase(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    secret: Field
  ) {
    const currentSecretToken = this.secretToken.get();
    this.secretToken.assertEquals(currentSecretToken);

    const currentOracle = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(currentOracle);

    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);

    const currentCID = this.ipfsCID.get();
    this.ipfsCID.assertEquals(currentCID);

    const sentSecret = Poseidon.hash([secret]);
    this.secretToken.assertEquals(sentSecret);

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
  }

  @method initBase(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    updatedSecret: Field
  ) {
    const currentSecretToken = this.secretToken.get();
    this.secretToken.assertEquals(currentSecretToken);

    const currentOracle = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(currentOracle);

    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);

    const currentCID = this.ipfsCID.get();
    this.ipfsCID.assertEquals(currentCID);

    /// Can only be called once
    this.secretToken.assertEquals(Field.from(0));

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
    this.secretToken.set(Poseidon.hash([updatedSecret]));
  }

  @method verify(signature: Signature, Price: Field) {
    // Get the oracle public key from the contract state
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);
    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(oraclePublicKey, [Price]);
    // Check that the signature is valid
    validSignature.assertTrue();
  }
}
