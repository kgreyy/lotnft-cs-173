import axios from 'axios';
import FormData from 'form-data';
import {char2Bytes} from "@taquito/utils"

// TODO - 8 create a function sendFileToIPFS and send a POST request to
// pinata api using you api key to get the cid of the image blob
var bigInt = require("big-integer");


export const sendFileToIPFS = async (ImageBlob) => {

        try {

            const formData = new FormData();
            formData.append("file", ImageBlob);

            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    pinata_api_key: '4905922d7cbc541bab9c',
                    pinata_secret_api_key: '3b6f68b80a2b353961346d95295bb88c8cd98b850e49c6f7b9db3b15f6a5bfb8',
                    "Content-Type": "multipart/form-data"
                },
            });

            const ImgHash = `ipfs://${resFile.data.IpfsHash}`;

            console.log(ImgHash); 

         return{
            sucess : true,
            Ipfs : ImgHash,
        };

        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
            return{
                success : false,
                Ipfs : "",
            };
        }
    }



// TODO 10.2 - create a jsonToPinata helper function to pin the json metadata to pinata
const jsonToPinata = async (json) =>  {

    console.log('inside JSON to pinata');
    try {

        const data = JSON.stringify(json);

        var config = {
            method: 'post',
            url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            headers: { 
              'Content-Type': 'application/json', 
              pinata_api_key: '4905922d7cbc541bab9c',
              pinata_secret_api_key: '3b6f68b80a2b353961346d95295bb88c8cd98b850e49c6f7b9db3b15f6a5bfb8',
            },
            data : data
          };
          
          const res = await axios(config);
        return{
            success : true,
            Ipfs : res.data.IpfsHash,
        };

    } catch (error) {
        console.log(error);
        return{
            success:false,
            Ipfs : "",
        };
        
    }

}

// from https://github.com/Cryptonomic/ConseilJS/blob/master/src/chain/tezos/TezosMessageUtil.ts
export const writeInt = (value) => {
    if (value < 0) { throw new Error('Use writeSignedInt to encode negative numbers'); }
    //@ts-ignore
    return Buffer.from(Buffer.from(twoByteHex(value), 'hex').map((v, i) => { return i === 0 ? v : v ^ 0x80; }).reverse()).toString('hex');
}

function twoByteHex(n) {
    if (n < 128) { return ('0' + n.toString(16)).slice(-2); }

    let h = '';
    if (n > 2147483648) {
        let r = bigInt(n);
        while (r.greater(0)) {
            h = ('0' + (r.and(127)).toString(16)).slice(-2) + h;
            r = r.shiftRight(7);
        }
    } else {
        let r = n;
        while (r > 0) {
            h = ('0' + (r & 127).toString(16)).slice(-2) + h;
            r = r >> 7;
        }
    }

    return h;
}


// TODO 10.1 - create a pinataWrapper function to convert the name , event name and image
// into metadata of a Tezos NFT and pin it to pinata to return the ipfs cid 
export const pinataWrapper = async (formData, image) =>  {

    try {
        let data = {};
        data.name = char2Bytes("LotNFT");
        data.description = char2Bytes("This NFT corresponds to your ownership of a Lot!");
        data.artifactUri = char2Bytes(image);
        data.displayUri = char2Bytes(image);
        data.thumbnailUri = char2Bytes(image);
        data.image_url = char2Bytes(image);
        data.decimals = char2Bytes("0");

        data.lot_id = writeInt(parseInt(formData['lot_id']));
        data.description = char2Bytes(formData['description']);
        data.image_url = char2Bytes(image);
        data.owner_title = formData['owner_title'];
        data.units = writeInt(parseInt(formData['units']));
        
        data.symbol = char2Bytes("LNFT");
        data.rights =  char2Bytes("All rights reserved.");

        const res = await jsonToPinata(data);

        return data;

    } catch (error) {
        console.log(error);
        return{
            success:false,
            Ipfs : "",
        };
        
    }

}
