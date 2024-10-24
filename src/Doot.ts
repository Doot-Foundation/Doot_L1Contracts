import {
  SmartContract,
  Field,
  method,
  State,
  state,
  PublicKey,
  Signature,
  Experimental,
  Struct,
  Provable,
} from 'o1js';
const { OffchainState } = Experimental;
import { MultiPackedStringFactory } from 'o1js-pack';

export class TokenInformationArray extends Struct({
  prices: Provable.Array(Field, 10),
}) {}
export const offchainState = OffchainState(
  {
    tokenInformation: OffchainState.Map(Field, TokenInformationArray),
  },
  { maxActionsPerUpdate: 2 }
);
export class TokenInformationArrayProof extends offchainState.Proof {}

export class IpfsCID extends MultiPackedStringFactory(2) {}

// Tokens is the CircuitString.hash().
export class Doot extends SmartContract {
  @state(Field) commitment = State<Field>();
  @state(IpfsCID) ipfsCID = State<IpfsCID>();
  @state(PublicKey) owner = State<PublicKey>();
  @state(OffchainState.Commitments) offchainStateCommitments =
    offchainState.emptyCommitments();

  init() {
    super.init();
  }

  offchainState = offchainState.init(this);

  /// Can only be called once
  @method async initBase(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    informationArray: TokenInformationArray
  ) {
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();
    this.owner.getAndRequireEquals();

    this.owner.requireEquals(PublicKey.empty());

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
    this.owner.set(this.sender.getAndRequireSignatureV2());

    const lastPriceInformation =
      await this.offchainState.fields.tokenInformation.get(Field(1));
    this.offchainState.fields.tokenInformation.update(Field(1), {
      from: lastPriceInformation.value,
      to: informationArray,
    });
  }

  @method async update(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    informationArray: TokenInformationArray
  ) {
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();
    this.owner.getAndRequireEquals();

    this.owner.requireEquals(this.sender.getAndRequireSignatureV2());

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);

    const lastPriceInformation =
      await this.offchainState.fields.tokenInformation.get(Field(1));
    this.offchainState.fields.tokenInformation.update(Field(1), {
      from: lastPriceInformation.value,
      to: informationArray,
    });
  }

  @method.returns(TokenInformationArray)
  async getPrices() {
    return (await this.offchainState.fields.tokenInformation.get(Field(1)))
      .value;
  }

  @method
  async settle(proof: TokenInformationArrayProof) {
    await this.offchainState.settle(proof);
  }

  @method async verify(
    signature: Signature,
    deployer: PublicKey,
    Price: Field
  ) {
    const validSignature = signature.verify(deployer, [Price]);
    validSignature.assertTrue();
  }
}
