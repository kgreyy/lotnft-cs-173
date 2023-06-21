import { pinataWrapper, sendFileToIPFS } from '../utils/pinata';
import { mintOperation } from '../utils/operation';


// TODO 7.4 - getImageData from the html canvas to an image blob
const getImageData = async (imageDataUrl) => {
    const imageBlob = await fetch(imageDataUrl).then((res) => res.blob());
    return imageBlob;
}

// TODO 9 - get the Image IPFS by sending Image blob to pinata 
const getImageIPFS = async (imageDataUrl) => {
    try {
        const blob = await getImageData(imageDataUrl);
        const res = await sendFileToIPFS(blob)
        return res.Ipfs;
    } catch (error) {
        console.log(error) 
    }
    return ""
}

// TODO 11 - get complate metadata of NFT ready for minting
const getMintingMetadata = async (formData, imageDataUrl) => {
    const imageIPFS = getImageIPFS(imageDataUrl)
    try {
        const res = await pinataWrapper(formData, imageIPFS)
        return res;
    } catch (error) 
    {
        console.log("Mint metadata error:", error);
    }
    return ""
}

// TODO 12 - call the minting operation with the created metadata of the NFT
export const mintingOperation = async (formData, imageDataUrl) => {
    const data = await getMintingMetadata(formData, imageDataUrl);
    await mintOperation(data)
};
