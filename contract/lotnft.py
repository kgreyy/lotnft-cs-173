import smartpy as sp

from templates import fa2_lib as fa2
from templates import fa2_lib_testing as testing

def make_metadata(name, lot_id, image_url, owner_title, units, desc):
    """Helper function to build metadata JSON bytes values."""
    return sp.map(
        l={
            "name": sp.utils.bytes_of_string(name),
            "symbol": sp.utils.bytes_of_string("LTNFT"),
            "decimals": sp.utils.bytes_of_string("1"),
            "description": sp.utils.bytes_of_string(desc),
            "lot_id": sp.pack(lot_id),
            "image_url": sp.utils.bytes_of_string("ipfs://example"),
            "owner_title": sp.utils.bytes_of_string(owner_title),
            "units": sp.pack(units)
        }
    )

administrator = sp.address("tz1SHC1xaNZsZ19K4nJYoLutQYt5J3qJhUBc")
alice = sp.test_account("Alice")
bob = sp.test_account("Bob")
tok0_md = make_metadata(name="Token Zero", lot_id=0, image_url="ipfs://sana", owner_title="One", desc="one", units=100)
tok1_md = make_metadata(name="Token One", lot_id=1, image_url="ipfs://sana", owner_title="Two", desc="two", units=50)
tok2_md = make_metadata(name="Token Two", lot_id=2, image_url="ipfs://sana", owner_title="Three", desc="three", units=100)
tok3_md = make_metadata(name="Token Three", lot_id=1, image_url="ipfs://sana", owner_title="Four", desc="four", units=50)
TOKEN_METADATA = [tok0_md, tok1_md, tok2_md, tok3_md]
METADATA = sp.utils.metadata_of_url("")

main = fa2.main


@sp.module
def m():
    # Order of inheritance: [Admin], [<policy>], <base class>, [<mixins>]
    lot_claims: type = sp.big_map[sp.nat, sp.nat]
    
    class LotNft(
        main.Admin,
        main.Nft,
        main.ChangeMetadata,
        main.WithdrawMutez,
        main.MintNft,
        main.BurnNft,
        main.OffchainviewTokenMetadata,
        main.OnchainviewBalanceOf,
    ):
        def __init__(self, administrator, metadata, ledger, token_metadata, max_cols, max_rows, time_unit_per_lot):
            main.OnchainviewBalanceOf.__init__(self)
            main.OffchainviewTokenMetadata.__init__(self)
            main.BurnNft.__init__(self)
            main.MintNft.__init__(self)
            main.WithdrawMutez.__init__(self)
            main.ChangeMetadata.__init__(self)
            main.Nft.__init__(self, metadata, ledger, token_metadata)
            main.Admin.__init__(self, administrator)
            self.data.lot_claims = sp.cast(sp.big_map(), lot_claims)
            self.data.max_columns = max_cols
            self.data.max_rows = max_rows
            self.data.last_token_id = 0
            self.data.time_unit_per_lot = time_unit_per_lot

        @sp.entrypoint
        def mint(self, batch):

            sp.cast(
                batch,
                sp.list[
                    sp.record(
                        to_=sp.address,
                        metadata=sp.map[sp.string, sp.bytes],
                    ).layout(("to_", "metadata"))
                ],
            )
            
            # todo
            assert self.is_administrator_(), "FA2_NOT_ADMIN"
            
            for action in batch:
                lot = sp.unpack(action.metadata['lot_id'], sp.nat)
                assert not lot.is_none()
                lot_id = lot.unwrap_some()
                (x_coord, y_coord) = sp.ediv(lot_id, self.data.max_rows).unwrap_some(error="Division by 0")
                assert sp.cast(x_coord, sp.nat) < self.data.max_rows, "Over the x-coord limit"
                assert sp.cast(y_coord, sp.nat) < self.data.max_columns, "Over the y-coord limit"
                units = sp.unpack(action.metadata['units'], sp.nat).unwrap_some()
                assert self.data.lot_claims.get(sp.unpack(action.metadata['lot_id'], sp.nat).unwrap_some(), default=self.data.time_unit_per_lot) > sp.nat(0), "Lot already fully claimed"
                assert self.data.lot_claims.get(sp.unpack(action.metadata['lot_id'], sp.nat).unwrap_some(), default=self.data.time_unit_per_lot) >= units, "Too many units being reserved"
                
                token_id = self.data.last_token_id
                
                self.data.ledger[token_id] = action.to_


                self.data.token_metadata[token_id] = sp.record(
                    token_id=token_id, token_info={
                        "name": sp.pack("LotNFT"),
                        "symbol": action.metadata['symbol'],
                        "lot_id": action.metadata['lot_id'],
                        "decimals": action.metadata['decimals'],
                        "x_coord": sp.pack(x_coord),
                        "y_coord": sp.pack(y_coord),
                        "units": action.metadata['units'],
                        "description": action.metadata['description'],
                        "image_url": action.metadata['image_url'],
                        "owner_title": action.metadata["owner_title"],
                    })
                self.data.lot_claims[lot_id] = sp.as_nat(self.data.lot_claims.get(sp.unpack(action.metadata['lot_id'], sp.nat).unwrap_some(), default=self.data.time_unit_per_lot) - units)
                
                self.data.last_token_id += 1
            

'''
@sp.add_test(name="NFT", is_default=True)
def test():
    ledger = {0: alice.address, 1: alice.address, 2: alice.address}
    token_metadata = TOKEN_METADATA

    # Default NFT
    c1 = m.LotNft(
        administrator=administrator.address,
        metadata=METADATA,
        ledger=ledger,
        token_metadata=token_metadata,
    )

    kwargs = {"modules": [fa2.t, fa2.main, m], "ledger_type": "NFT"}

    # Standard features
    testing.test_core_interfaces(c1, **kwargs)
    testing.test_transfer(c1, **kwargs)
    testing.test_balance_of(c1, **kwargs)
'''

@sp.module
def helpers():
    t_balance_of_response: type = sp.record(
        request=sp.record(owner=sp.address, token_id=sp.nat).layout(
            ("owner", "token_id")
        ),
        balance=sp.nat,
    ).layout(("request", "balance"))

    class TestReceiverBalanceOf(sp.Contract):
        """Helper used to test the `balance_of` entrypoint.

        Don't use it on-chain as it can be tricked.
        """

        def __init__(self):
            self.data.last_received_balances = []

        @sp.entrypoint
        def receive_balances(self, params):
            sp.cast(params, sp.list[t_balance_of_response])
            self.data.last_received_balances = params

    class Wallet(sp.Contract):
        @sp.entrypoint
        def default(self):
            pass

@sp.add_test(name="NFT_Mint", is_default=True)
def tester():
    ledger = {}
    token_metadata = TOKEN_METADATA
    
    sc = sp.test_scenario([fa2.t, fa2.main, m])
    sc.add_module(helpers)
    sc.h1("test_mint")
    sc.p("A call to mint view.")

    # Default NFT
    c1 = m.LotNft(
        administrator=sp.address("tz1SHC1xaNZsZ19K4nJYoLutQYt5J3qJhUBc"),
        metadata=sp.utils.metadata_of_url(""),
        ledger={},
        token_metadata=[],
        max_cols=sp.nat(5), max_rows=sp.nat(3),
        time_unit_per_lot=sp.nat(100)
    )
    
    sc.h2("Accounts")
    sc.show([alice, bob])

    sc.h2("FA2 contract")
    sc += c1
    
    # Standard features
    c1.mint(
                [
                    sp.record(metadata=tok0_md, to_=alice.address),
                    sp.record(metadata=tok1_md, to_=alice.address),
                    sp.record(metadata=tok2_md, to_=bob.address),
                    sp.record(metadata=tok3_md, to_=bob.address),
                ]
            ).run(sender=administrator)
