import {
  SmartContract,
  method,
  State,
  state,
  PublicKey,
  Field,
  Poseidon,
} from 'o1js';
import { MultiPackedStringFactory } from 'o1js-pack';

export class SourceCodeGithub extends MultiPackedStringFactory(3) {}
export class SourceCodeIPFS extends MultiPackedStringFactory(2) {}

export class Registry extends SmartContract {
  @state(SourceCodeGithub) githubSourceLink = State<SourceCodeGithub>();
  @state(SourceCodeIPFS) ipfsSourceLink = State<SourceCodeIPFS>();
  @state(PublicKey) implementation = State<PublicKey>();
  @state(Field) secretToken = State<Field>();

  init() {
    super.init();
  }

  @method async initBase(secret: Field) {
    this.githubSourceLink.getAndRequireEquals();
    this.ipfsSourceLink.getAndRequireEquals();
    this.implementation.getAndRequireEquals();
    this.secretToken.getAndRequireEquals();

    // Can only be called once.
    this.secretToken.requireEquals(Field(0));

    const toSet = Poseidon.hash([secret]);
    this.secretToken.set(toSet);
  }

  @method async update(
    updatedGithubLink: SourceCodeGithub,
    updatedIPFSLink: SourceCodeIPFS,
    updatedImplementation: PublicKey,
    deployer: PublicKey,
    secret: Field
  ) {
    this.githubSourceLink.getAndRequireEquals();
    this.ipfsSourceLink.getAndRequireEquals();
    this.implementation.getAndRequireEquals();
    this.secretToken.getAndRequireEquals();

    this.secretToken.requireEquals(Poseidon.hash([secret]));

    this.githubSourceLink.set(updatedGithubLink);
    this.ipfsSourceLink.set(updatedIPFSLink);
    this.implementation.set(updatedImplementation);
  }
}
