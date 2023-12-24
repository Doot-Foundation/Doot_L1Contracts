import { Doot, IpfsCID } from './Doot';
import {
  PrivateKey,
  PublicKey,
  Field,
  Mina,
  AccountUpdate,
  CircuitString,
} from 'o1js';

describe('Doot.js', () => {
  let oraclePK: PrivateKey,
    oracle: PublicKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    dootZkApp: Doot;

  beforeAll(async () => {
    await Doot.compile();
  });

  beforeEach(async () => {
    // setup local blockchain
    let Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    // Local.testAccounts is an array of 10 test accounts that have been pre-filled with Mina
    oraclePK = Local.testAccounts[0].privateKey;
    oracle = oraclePK.toPublicKey();
    // zkapp account
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
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
    it('Should set initial ipfs hash to ipfs://', async () => {
      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      //     .map((x) => x.toString())
      //     .join('')
      // );
      const expected = 'ipfs://';
      expect(onChainIpfsCid.toString()).toEqual(expected);
    });

    it('Should set initial map root to 0', async () => {
      const onChainRoot = dootZkApp.commitment.get();
      const expected = Field.from(0);

      expect(onChainRoot).toEqual(expected);
    });
  });

  describe('Add/Update', () => {
    // it('Should add an asset called Ethereum and update the base root + IPFS hash', async () => {});
    // it('Should update an existing asset called Ethereum including the base root + IPFS hash', async () => {});
  });
});
