// api.js

import { burnOperation, transferOperation } from "../utils/operation";
import { contract_address } from "../utils/tezos";
import { TezosMessageUtils } from "../utils/TezosMessageUtil";
import axios from 'axios';

// Mock data for owned tokens
const mockOwnedTokens = [
    { tokenID: 1, metadata: 'Token 1 metadata' },
    { tokenID: 2, metadata: 'Token 2 metadata' },
    { tokenID: 3, metadata: 'Token 3 metadata' },
  ];
    
  // Function to transfer a token
  export const transferToken = async (destination, tokenID) => {
    // Simulating an API call to transfer the token
    return await transferOperation(tokenID, destination);
  };
  
  // Function to burn a token
  export const burnToken = async (tokenID) => {
    // Simulating an API call to burn the token
    return await burnOperation(tokenID);
  };

  // Function to fetch the list of owned tokens
  export const getTokenList = async () => {
    // Simulating an API call to fetch the list of owned tokens
    return await axios.get("https://api.ghostnet.tzkt.io/v1/contracts/"+contract_address+"/bigmaps/token_metadata/keys");
  };

  export const processTokenInfo = (token_info) => {
    const out = {};
    Object.entries(token_info).map((val) => {
      if (val[0]=='lot_id'||val[0]=='units'||val[0]=='x_coord'||val[0]=='y_coord'){
        out[val[0]] = TezosMessageUtils.readPackedData(val[1], "nat");
      } else {
        out[val[0]] = TezosMessageUtils.readPackedData(val[1], "string");
    }
    })
    return out
  }

export const processToken = (data) => {
  return data.map(val => {
    return {token_id: val.value.token_id, token_info: processTokenInfo(val.value.token_info)};
 })
};

export const getImage = (ipfs) => {
  return "https://gateway.pinata.cloud/ipfs/"+ipfs.substring(7);
}