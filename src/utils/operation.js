
import { contract_address, tezos } from "./tezos";
import { MichelsonMap } from "@taquito/taquito";

import {getAccount} from "./wallet"
import { axios } from "axios";

const getMetadata = async (url) => {
    try {
        const response = await axios.get(url);
        const metadata = response.data; // Assuming the
        return metadata;
    } catch (err) {
        console.error('Error retrieving metadata:', err);
    }
}
export const mintOperation = async (data) => {
  try {
    const contractInstance = await tezos.wallet.at(contract_address);
    console.log(MichelsonMap.fromLiteral(data));
    const op = await contractInstance.methods.mint([{metadata: MichelsonMap.fromLiteral(data),
                                                    to_: await getAccount()}]).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};

export const burnOperation = async (tokenID) => {
  try {
      const contractInstance = await tezos.wallet.at(contract_address);
      console.log('Token ID is being burned.');
      const op = await contractInstance.methods
          .burn([
              {
                  from_: await getAccount(),
                  token_id: tokenID,
                  amount: 1,
              },
          ])
          .send();
      await op.confirmation(1);
    }
  catch (err) {
      throw err;
    }
}

export const transferOperation = async (tokenID, destAddress) => {
  try {
      const contractInstance = await tezos.wallet.at(contract_address);
      console.log('Token ID is being transferred.');
      const op = await contractInstance.methods
          .transfer([
              {
                  from_: await getAccount(),
                  txs: [
                    {
                      to_: destAddress,
                      token_id: tokenID,
                      amount: 1,
                    }
                  ],
              },
          ])
          .send();
      await op.confirmation(1);
    }
  catch (err) {
      throw err;
    }
}