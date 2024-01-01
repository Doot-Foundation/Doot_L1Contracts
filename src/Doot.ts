import {
  SmartContract,
  Field,
  method,
  MerkleMapWitness,
  State,
  state,
} from 'o1js';

import { MultiPackedStringFactory } from 'o1js-pack';

export class IpfsCID extends MultiPackedStringFactory(4) {}

export class Doot extends SmartContract {
  /// @notice Merkle Map Root to make sure the values are valid.
  @state(Field) commitment = State<Field>();

  /// @notice IPFS URL of the off-chain file which holds the asset price info upto the past 2 hours.
  /// @notice The historical data and latest data is separated.
  @state(IpfsCID) ipfsCID = State<IpfsCID>();

  @method init() {
    super.init();
  }

  @method update(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    valueToChange: Field,
    updatedCID: IpfsCID
  ) {
    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);

    const currentCID = this.ipfsCID.get();
    this.ipfsCID.assertEquals(currentCID);

    const [previousCommitment, key] = keyWitness.computeRootAndKey(valueBefore);
    previousCommitment.assertEquals(currentCommitment);
    key.assertEquals(keyToChange);

    const updatedCommitment = keyWitness.computeRootAndKey(valueToChange)[0];

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedCID);
  }

  @method setBase(updatedCommitment: Field, updatedIpfsCID: IpfsCID) {
    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);
    this.ipfsCID.getAndAssertEquals();

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
  }
}
