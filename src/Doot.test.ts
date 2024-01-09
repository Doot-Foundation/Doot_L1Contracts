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

    it(`Should set inital oracle to ${oracle}`, async () => {
      const onChainOracle = dootZkApp.oraclePublicKey.get();
      const expected = oracle;

      expect(onChainOracle).toEqual(expected);
    });

    it(`Should set inital secret to 0`, async () => {
      const onChainSecret = dootZkApp.secretToken.get();
      const expected = Field.from(0);

      expect(onChainSecret).toEqual(expected);
    });
  });

  describe('Add/Update', () => {
    const map: MerkleMap = new MerkleMap();
    const secret: Field = Field.random();
    let minaKey: Field;
    let minaPrice: Field;

    beforeAll(async () => {
      minaKey = await frameKey(CircuitString.fromString('Mina'));
      minaPrice = Field.from(7500000000);
    });

    it('Should add an asset called Mina and update the (BASE) commitment + IPFS hash + secret and fail the next time irrespective of the inputs.', async () => {
      map.set(minaKey, minaPrice);

      const updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTi'
      );
      const updatedCommitment = map.getRoot();

      let txn = await Mina.transaction(oracle, () => {
        dootZkApp.setBase(updatedCommitment, updatedIPFS, secret);
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const expectedIpfsCid = 'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYHTi';

      const onChainCommitment = dootZkApp.commitment.get();
      const onChainSecret = dootZkApp.secretToken.get();

      console.log('INITIAL VALUES --->>>');
      console.log(onChainIpfsCid.toString(), onChainCommitment.toBigInt());
      expect(onChainIpfsCid.toString()).toEqual(expectedIpfsCid);
      expect(onChainCommitment).toEqual(updatedCommitment);
      expect(onChainSecret).toEqual(Poseidon.hash([secret]));

      try {
        txn = await Mina.transaction(oracle, () => {
          dootZkApp.setBase(updatedCommitment, updatedIPFS, secret);
        });
        await txn.prove();
        const signed = txn.sign([oraclePK]);

        await signed.send();
        throw new Error('Expected_transaction_to_fail');
      } catch (err: any) {
        expect(err.message).toContain(
          'Account_app_state_precondition_unsatisfied'
        );
      }
    });
    it('Should update an existing asset called Mina including the base root + IPFS hash only if the secret is known.', async () => {
      let updatedIPFS: IpfsCID;
      let updatedPrice: Field;
      let updatedCommitment: Field;
      let txn: Mina.Transaction;

      let minaWitness: MerkleMapWitness = map.getWitness(minaKey);

      updatedPrice = Field.from(12300000000);
      updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjY009'
      );

      txn = await Mina.transaction(oracle, () => {
        dootZkApp.update(
          minaWitness,
          minaKey,
          minaPrice,
          updatedPrice,
          updatedIPFS,
          secret
        );
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const expectedIpfsCid = 'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjY009';

      map.set(minaKey, updatedPrice);
      updatedCommitment = map.getRoot();
      const onChainCommitment = dootZkApp.commitment.get();

      expect(onChainIpfsCid.toString()).toEqual(expectedIpfsCid);
      expect(onChainCommitment).toEqual(updatedCommitment);

      // ----------------

      let updatedUpdatedPrice = Field.from(15300000000);
      updatedIPFS = IpfsCID.fromString(
        'QmcNLBRwSQZDcdRe9uKUXZoLgnvTgAxx47Wfhod4JjYpqI'
      );

      try {
        txn = await Mina.transaction(oracle, () => {
          dootZkApp.update(
            minaWitness,
            minaKey,
            updatedPrice,
            updatedUpdatedPrice,
            updatedIPFS,
            Field.random()
          );
        });

        await txn.prove();
        const signed = txn.sign([oraclePK]);

        await signed.send();
        throw new Error('Expected_transaction_to_fail');
      } catch (err: any) {
        expect(err.message).toContain(
          'Account_app_state_precondition_unsatisfied'
        );
      }
    });
  });
});
