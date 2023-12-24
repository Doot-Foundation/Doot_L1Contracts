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

  /// @notice Timestamp to identify when the last changes were done.
  @state(Field) latestChangedAt = State<Field>();

  @method init() {
    super.init();

    this.commitment.set(Field.from(0));
    this.ipfsCID.set(IpfsCID.fromString('ipfs://'));
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

    this.latestChangedAt.set(Field.from(Date.now()));
    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedCID);
  }

  /// @dev Only to be used in case of desperate circumstances.
  @method setBase(commitment: Field, ipfsCID: IpfsCID) {
    const currentCommitment = this.commitment.get();
    this.commitment.assertEquals(currentCommitment);

    const initialIpfsCID = this.ipfsCID.get();
    this.ipfsCID.assertEquals(initialIpfsCID);

    this.latestChangedAt.set(Field.from(Date.now()));
    this.commitment.set(commitment);
    this.ipfsCID.set(ipfsCID);
  }
}
