import {
  SmartContract,
  Field,
  method,
  MerkleMapWitness,
  State,
  state,
  CircuitString,
} from 'o1js';

export class Doot extends SmartContract {
  /// Merkle Map Root to make sure the values are valid.
  @state(Field) mapRoot = State<Field>();
  /// IPFS hash of the off-chain file while holds the asset price info for the past hour.
  @state(CircuitString) ipfsHash = State<CircuitString>();

  @method init() {
    const initialRoot = Field.from(0);
    this.mapRoot.set(initialRoot);
    this.ipfsHash.set(CircuitString.fromString('ipfs://'));
  }

  @method update(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    valueToChange: Field,
    updatedHash: CircuitString
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);

    // check the initial state matches what we expect
    const [rootBefore, key] = keyWitness.computeRootAndKey(valueBefore);
    rootBefore.assertEquals(initialRoot);
    key.assertEquals(keyToChange);

    // compute the root after incrementing
    const [rootAfter, _] = keyWitness.computeRootAndKey(valueToChange);

    // set the new root
    this.mapRoot.set(rootAfter);
    this.ipfsHash.set(updatedHash);
  }

  @method insert(
    keyToAdd: Field,
    keyWitness: MerkleMapWitness,
    valueToAdd: Field,
    updatedHash: CircuitString
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);

    const [rootAfter, key] = keyWitness.computeRootAndKey(valueToAdd);
    key.assertEquals(keyToAdd);

    this.mapRoot.set(rootAfter);
    this.ipfsHash.set(updatedHash);
  }
}
