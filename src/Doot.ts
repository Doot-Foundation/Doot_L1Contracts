import {
  SmartContract,
  Field,
  method,
  MerkleMapWitness,
  State,
  state,
} from 'o1js';

export class Doot extends SmartContract {
  @state(Field) mapRoot = State<Field>();

  @method init() {
    const initialRoot = Field.from(0);
    this.mapRoot.set(initialRoot);
  }

  @method update(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    valueToChange: Field
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
  }

  @method insert(
    keyToAdd: Field,
    keyWitness: MerkleMapWitness,
    valueToAdd: Field
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);

    const [rootAfter, key] = keyWitness.computeRootAndKey(valueToAdd);
    key.assertEquals(keyToAdd);

    this.mapRoot.set(rootAfter);
  }
}
