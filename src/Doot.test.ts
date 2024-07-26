import { Doot, IpfsCID, PricesArray, offchainState } from './Doot';
import {
  PrivateKey,
  PublicKey,
  Field,
  Mina,
  Poseidon,
  AccountUpdate,
  MerkleMap,
  CircuitString,
} from 'o1js';

describe('Doot.js', () => {
  let oraclePK: PrivateKey,
    oracle: PublicKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    dootZkApp: Doot;

  beforeAll(async () => {
    // setup local blockchain
    let Local = await Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);
    // Local.testAccounts is an prices of 10 test accounts that have been pre-filled with Mina
    oraclePK = Local.testAccounts[0].key;
    oracle = oraclePK.toPublicKey();

    // zkapp account
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    dootZkApp = new Doot(zkAppAddress);
    offchainState.setContractInstance(dootZkApp);

    await offchainState.compile();
    await Doot.compile();

    // dootZkApp = new Doot(zkAppAddress);
    // deploy zkapp
    let txn = await Mina.transaction(oracle, async () => {
      AccountUpdate.fundNewAccount(oracle);
      await dootZkApp.deploy();
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
      const onChainOracle = dootZkApp.deployerPublicKey.get();
      const expected = oracle;

      expect(onChainOracle).toEqual(expected);
    });

    it(`Should set inital secret to 0`, async () => {
      const onChainSecret = dootZkApp.secret.get();
      const expected = Field.from(0);

      expect(onChainSecret).toEqual(expected);
    });
  });

  describe('Add/Update', () => {
    const map: MerkleMap = new MerkleMap();

    const secret: Field = Field.random();

    let minaKey: Field;
    let bitcoinKey: Field;
    let chainlinkKey: Field;
    let solanaKey: Field;
    let ethereumKey: Field;
    let cardanoKey: Field;
    let avalancheKey: Field;
    let rippleKey: Field;
    let dogeKey: Field;
    let polygonKey: Field;

    let minaPrice: Field;
    let bitcoinPrice: Field;
    let ethereumPrice: Field;
    let solanaPrice: Field;
    let chainlinkPrice: Field;
    let cardanoPrice: Field;
    let avalanchePrice: Field;
    let ripplePrice: Field;
    let polygonPrice: Field;
    let dogePrice: Field;

    let prices: PricesArray;

    beforeAll(async () => {
      minaKey = CircuitString.fromString('Mina').hash();
      bitcoinKey = CircuitString.fromString('Bitcoin').hash();
      chainlinkKey = CircuitString.fromString('Chainlink').hash();
      solanaKey = CircuitString.fromString('Solana').hash();
      ethereumKey = CircuitString.fromString('Ethereum').hash();
      cardanoKey = CircuitString.fromString('Cardano').hash();
      avalancheKey = CircuitString.fromString('Avalanche').hash();
      rippleKey = CircuitString.fromString('Ripple').hash();
      dogeKey = CircuitString.fromString('Dogecoin').hash();
      polygonKey = CircuitString.fromString('Polygon').hash();

      minaPrice = Field.from(5248770935);
      bitcoinPrice = Field.from(615439169547040);
      ethereumPrice = Field.from(34421115510507);
      solanaPrice = Field.from(1481398311039);
      chainlinkPrice = Field.from(143095980879);
      cardanoPrice = Field.from(3907233838);
      avalanchePrice = Field.from(278604715977);
      ripplePrice = Field.from(4749419511);
      polygonPrice = Field.from(5645415935);
      dogePrice = Field.from(1261024335);
    });

    it('Should init the (BASE) commitment, IPFS hash, secret and prices. Fail the next time irrespective of the inputs.', async () => {
      map.set(minaKey, minaPrice);
      map.set(bitcoinKey, bitcoinPrice);
      map.set(chainlinkKey, chainlinkPrice);
      map.set(solanaKey, solanaPrice);
      map.set(ethereumKey, ethereumPrice);
      map.set(cardanoKey, cardanoPrice);
      map.set(avalancheKey, avalanchePrice);
      map.set(rippleKey, ripplePrice);
      map.set(dogeKey, dogePrice);
      map.set(polygonKey, polygonPrice);

      prices = new PricesArray({
        prices: [
          minaPrice,
          bitcoinPrice,
          ethereumPrice,
          solanaPrice,
          ripplePrice,
          cardanoPrice,
          avalanchePrice,
          polygonPrice,
          chainlinkPrice,
          dogePrice,
        ],
      });

      const updatedIPFS = IpfsCID.fromString(
        'QmQy34PrqnoCBZySFAkRsC9q5BSFESGUxX6X8CQtrNhtrB'
      );
      const updatedCommitment = map.getRoot();

      let txn = await Mina.transaction(oracle, async () => {
        await dootZkApp.initBase(
          updatedCommitment,
          updatedIPFS,
          prices,
          secret
        );
      });
      await txn.prove();
      await txn.sign([oraclePK]).send();

      const onChainIpfsCID = dootZkApp.ipfsCID.get();
      const onChainIpfsCid = IpfsCID.fromCharacters(
        IpfsCID.unpack(onChainIpfsCID.packed)
      );
      const expectedIpfsCid = 'QmQy34PrqnoCBZySFAkRsC9q5BSFESGUxX6X8CQtrNhtrB';

      const onChainCommitment = dootZkApp.commitment.get();
      const onChainSecret = dootZkApp.secret.get();

      expect(onChainIpfsCid.toString()).toEqual(expectedIpfsCid);
      expect(onChainCommitment).toEqual(updatedCommitment);
      expect(onChainSecret).toEqual(Poseidon.hash([secret]));

      try {
        txn = await Mina.transaction(oracle, async () => {
          await dootZkApp.initBase(
            updatedCommitment,
            updatedIPFS,
            prices,
            secret
          );
        });
        await txn.prove();
        await txn.sign([oraclePK]).send();

        throw new Error('Expected_transaction_to_fail');
      } catch (err: any) {
        expect(err.message).toContain(
          'Account_app_state_precondition_unsatisfied'
        );
      }
    });
    it('Should update the storage only if the secret is known.', async () => {
      const updatedIPFS = IpfsCID.fromString(
        'QmQy34PrqnoCBZySFAkRsC9q5BSFESGUxX6X8CQtr11110'
      );
      const updatedPrice = Field.from(6048770935);
      map.set(minaKey, updatedPrice);

      prices = new PricesArray({
        prices: [
          updatedPrice,
          bitcoinPrice,
          ethereumPrice,
          solanaPrice,
          ripplePrice,
          cardanoPrice,
          avalanchePrice,
          polygonPrice,
          chainlinkPrice,
          dogePrice,
        ],
      });

      const updatedCommitment = map.getRoot();
      const onChainCommitment = dootZkApp.commitment.get();
      expect(onChainCommitment != updatedCommitment);

      await Mina.transaction(oracle, async () => {
        await dootZkApp.update(updatedCommitment, updatedIPFS, prices, secret);
      })
        .prove()
        .sign([oraclePK])
        .send();

      // ----------------
      try {
        await Mina.transaction(oracle, async () => {
          await dootZkApp.update(
            updatedCommitment,
            updatedIPFS,
            prices,
            Field.random()
          );
        })
          .prove()
          .sign([oraclePK])
          .send();

        throw new Error('Expected_transaction_to_fail');
      } catch (err: any) {
        expect(err.message).toContain(
          'Account_app_state_precondition_unsatisfied'
        );
      }
    });
  });
});
