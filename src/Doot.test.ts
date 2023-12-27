import { Doot, IpfsCID } from './Doot';
import {
  PrivateKey,
  PublicKey,
  Field,
  Mina,
  AccountUpdate,
  Poseidon,
  MerkleMap,
  MerkleMapWitness,
  CircuitString,
} from 'o1js';

async function frameKey(key: CircuitString) {
  return Poseidon.hash(key.toFields());
}

describe('Doot.js', () => {
  let oraclePK: PrivateKey,
    oracle: PublicKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    dootZkApp: Doot;

  beforeAll(async () => {
    // setup local blockchain
    let Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    // Local.testAccounts is an array of 10 test accounts that have been pre-filled with Mina
    oraclePK = Local.testAccounts[0].privateKey;
    oracle = oraclePK.toPublicKey();
    // zkapp account
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    await Doot.compile();

    dootZkApp = new Doot(zkAppAddress);
    // deploy zkapp
    let txn = await Mina.transaction(oracle, () => {
      AccountUpdate.fundNewAccount(oracle);
      dootZkApp.deploy({ zkappKey: zkAppPrivateKey });
    });
    await txn.prove();
    await txn.sign([oraclePK, zkAppPrivateKey]).send();
  });

  describe('Init', () => {
    it("Should set initial ipfs hash to ''", async () => {
      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const expected = '';
      expect(onChainIpfsCid.toString()).toEqual(expected);
    });

    it('Should set initial map root to 0', async () => {
      const onChainCommitment = dootZkApp.commitment.get();
      const expected = Field.from(0);

      expect(onChainCommitment).toEqual(expected);
    });
  });

  describe('Add/Update', () => {
    let minaKey: Field;
    let minaPrice: Field;
    const map = new MerkleMap();

    beforeEach(async () => {
      minaKey = await frameKey(CircuitString.fromString('Mina'));
      minaPrice = Field.from(7500000000);
    });
    it('Should add an asset called Mina and update the commitment + IPFS hash', async () => {
      map.set(minaKey, minaPrice);

      const updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTi'
      );
      const updatedCommitment = map.getRoot();

      const txn = await Mina.transaction(oracle, () => {
        dootZkApp.setBase(updatedCommitment, updatedIPFS);
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const onChainCommitment = dootZkApp.commitment.get();
      const expectedIpfsCid = 'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTi';

      console.log('INITIAL VALUES --->>>');
      console.log(onChainIpfsCid.toString(), onChainCommitment.toBigInt());
      expect(onChainIpfsCid.toString()).toEqual(expectedIpfsCid);
      expect(onChainCommitment).toEqual(updatedCommitment);
    });
    it('Should update an existing asset called Mina including the base root + IPFS hash', async () => {
      let updatedIPFS: IpfsCID;
      let updatedCommitment: Field;
      let txn: Mina.Transaction;

      map.set(minaKey, minaPrice);
      updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTi'
      );
      updatedCommitment = map.getRoot();

      txn = await Mina.transaction(oracle, () => {
        dootZkApp.setBase(updatedCommitment, updatedIPFS);
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      // Considering that you have the data off-chain and can easily construct the merkle map.
      // const map = new MerkleMap()
      // map.set(minaKey)
      const minaWitness: MerkleMapWitness = map.getWitness(minaKey);
      const updatedPrice = Field.from(12300000000);

      map.set(minaKey, updatedPrice);
      updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTI'
      );
      updatedCommitment = map.getRoot();

      txn = await Mina.transaction(oracle, () => {
        dootZkApp.update(
          minaWitness,
          minaKey,
          minaPrice,
          updatedPrice,
          updatedIPFS
        );
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const onChainCommitment = dootZkApp.commitment.get();
      const expectedIpfsCid = 'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTI';

      console.log('FINAL VALUES --->>>');
      console.log(onChainIpfsCid.toString(), onChainCommitment.toBigInt());
      expect(onChainIpfsCid.toString()).toEqual(expectedIpfsCid);
      expect(onChainCommitment).toEqual(updatedCommitment);
    });
  });
});
