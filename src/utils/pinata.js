import axios from 'axios';
import FormData from 'form-data';
import { TezosMessageUtils } from './TezosMessageUtil';
// import {char2Bytes} from "@taquito/utils"

// TODO - 8 create a function sendFileToIPFS and send a POST request to
// pinata api using you api key to get the cid of the image blob
var bigInt = require("big-integer");

const writePackedData = TezosMessageUtils.writePackedData

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


// TODO 10.1 - create a pinataWrapper function to convert the name , event name and image
// into metadata of a Tezos NFT and pin it to pinata to return the ipfs cid 
export const pinataWrapper = async (formData, image) =>  {

    try {
        let data = {};
        data.name = writePackedData("LotNFT", "string");
        data.description = writePackedData("This NFT corresponds to your ownership of a Lot!", "string");
        data.artifactUri = writePackedData(image, "string");
        data.displayUri = writePackedData(image, "string");
        data.thumbnailUri = writePackedData(image, "string");
        data.image_url = writePackedData(image, "string");
        data.decimals = writePackedData("0", "string");

        data.lot_id = writePackedData(parseInt(formData['lot_id']), "nat");
        data.description = writePackedData(formData['description'], "string");
        data.image_url = writePackedData(image, "string");
        data.owner_title = writePackedData(formData['owner_title'], "string");
        data.units = writePackedData(parseInt(formData['units']), "nat");
        
        data.symbol = writePackedData("LNFT", "string");
        data.rights =  writePackedData("All rights reserved.", "string");

        // const res = await jsonToPinata(data);
        Object.keys(data).forEach(function(key, _) {
            data[key] = data[key];
          });
        return data;

    } catch (error) {
        console.log(error);
        return{
            success:false,
            Ipfs : "",
        };
        
    }

}
