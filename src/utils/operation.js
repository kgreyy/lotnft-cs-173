
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
    const op = await contractInstance.methods.mint([{metadata: MichelsonMap.fromLiteral(data),
                                                    to_: await getAccount()}]).send();
    await op.confirmation(1);
  } catch (err) {
    throw err;
  }
};
