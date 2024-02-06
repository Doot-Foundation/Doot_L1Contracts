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

export class IpfsCID extends MultiPackedStringFactory(2) {}

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
    this.oraclePublicKey.getAndRequireEquals();
    this.secretToken.getAndRequireEquals();
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();

    const sentSecret = Poseidon.hash([secret]);
    this.secretToken.assertEquals(sentSecret);

    const [previousCommitment, key] = keyWitness.computeRootAndKey(valueBefore);
    previousCommitment.assertEquals(this.commitment.get());
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
    this.oraclePublicKey.getAndRequireEquals();
    this.secretToken.getAndRequireEquals();
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();

    const sentSecret = Poseidon.hash([secret]);
    this.secretToken.requireEquals(sentSecret);

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
  }

  @method initBase(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    updatedSecret: Field
  ) {
    this.oraclePublicKey.getAndRequireEquals();
    this.secretToken.getAndRequireEquals();
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();

    /// Can only be called once
    this.secretToken.requireEquals(Field.from(0));

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
    this.secretToken.set(Poseidon.hash([updatedSecret]));
  }

  @method verify(signature: Signature, Price: Field) {
    // Get the oracle public key from the contract state
    this.oraclePublicKey.getAndRequireEquals();

    // Evaluate whether the signature is valid for the provided data
    const validSignature = signature.verify(this.oraclePublicKey.get(), [
      Price,
    ]);
    // Check that the signature is valid
    validSignature.assertTrue();
  }
}
