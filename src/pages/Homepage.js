import React, { useState, useEffect } from 'react';
import { getOwnedTokens, burnToken } from './api';
import { Link } from 'react-router-dom';
import { getTokenList } from './api';
import axios from 'axios';
import './Homepage.css';
import { connectWallet, getAccount } from "../utils/wallet";
import { mintingOperation } from "../components/Minter"


import ImageUploading from "react-images-uploading";


const rootElement = document.getElementById("root");

const MintPopup = ({ onClose }) => {
  const [formData, setFormData] = useState({
    lot_id: '',
    owner_title: '',
    description: '',
    image_url: '',
  });
  const [error, setError] = useState('');

  const [images, setImages] = useState([]);
  const maxNumber = 1;
  const onImgChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await mintingOperation(formData, images[0].data_url); // Replace with your API endpoint to handle minting
      console.log(response.data); // Handle the response as needed
    } catch (error) {
      setError('Error occurred: ' + error.message);
    }
  };

  

  return (
    <div className="mint-popup">
      <div className="popup-header">
        <h1 className="transfer-page-title"style={{ fontFamily: 'Montserrat' }}>Mint NFT</h1>
        <button className="close-button" onClick={onClose}>
          x
        </button>
      </div>
      <div className="transfer-page-container">
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-field">
            <label htmlFor="lot_id" className="form-label">
              Lot ID:   
            </label>
            <input
              type="text"
              id="lot_id"
              name="lot_id"
              value={formData.lot_id}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="owner_title" className="form-label">
              Owner Title:
            </label>
            <input
              type="text"
              id="owner_title"
              name="owner_title"
              value={formData.owner_title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Description:
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="image_url" className="form-label">
              Image URL:
            </label>
            <input
              type="text"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <ImageUploading
              multiple
              value={images}
              onChange={onImgChange}
              maxNumber={maxNumber}
              dataURLKey="data_url"
              acceptType={["jpg"]}
            >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps
          }) => (
            // write your building UI
            <div className="upload__image-wrapper">
              <button
                style={isDragging ? { color: "red" } : null}
                onClick={onImageUpload}
                {...dragProps}
              >
                Click or Drop here
              </button>
              &nbsp;
              <button onClick={onImageRemoveAll}>Remove all images</button>
              {imageList.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image.data_url} alt="" width="100" />
                  <div className="image-item__btn-wrapper">
                    <button onClick={() => onImageUpdate(index)}>Update</button>
                    <button onClick={() => onImageRemove(index)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </ImageUploading>
          <button type="submit" className="transfer-button">
            Mint
          </button>
        </form>
      </div>
    </div>
  );
};

const TransferPopup = ({ onClose }) => {
  const [ownedTokens, setOwnedTokens] = useState([]); // State to hold the list of owned tokens
  const [destination, setDestination] = useState('');
  const [tokenID, setTokenID] = useState('');

  useEffect(() => {
    fetchOwnedTokens();
  }, []);

  // Function to fetch the list of owned tokens
  const fetchOwnedTokens = () => {
    // Call your API function to fetch the token list
    getTokenList()
      .then((response) => {
        setOwnedTokens(response.data);
      })
      .catch((error) => {
        console.log('Error fetching owned tokens:', error);
      });
  };

  // Function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    // Perform the transfer logic here, e.g., call an API endpoint
    // with the destination and token ID values

    // Reset the form fields
    setDestination('');
    setTokenID('');
  };

  return (
    <div className="transfer-popup">
      <div className="popup-header">
        <h1 className="transfer-page-title"style={{ fontFamily: 'Montserrat' }}>Transfer NFT</h1>
        <button className="close-button" onClick={onClose}>
          x
        </button>
      </div>
      <div className="transfer-page-container">
        <h2 className="form-heading">My Tokens</h2>
        {ownedTokens.length > 0 ? (
          <table className="owned-tokens-table">
            <thead>
              <tr>
                <th>Token ID</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              {ownedTokens.map((token) => (
                <tr key={token.tokenID}>
                  <td>{token.tokenID}</td>
                  <td>{token.metadata}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tokens owned.</p>
        )}
      </div>

      {/* Transfer Form */}
      <div className="transfer-page-container">
        <h2 className="form-heading">Transfer Token</h2>
        <form onSubmit={handleSubmit} className="transfer-form">
          <div className="form-field">
            <label htmlFor="destination" className="form-label">
              Destination:
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="tokenID" className="form-label">
              Token ID:
            </label>
            <input
              type="text"
              id="tokenID"
              value={tokenID}
              onChange={(event) => setTokenID(event.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="transfer-button">Transfer</button>
        </form>
      </div>
    </div>
  );
};

const BurnPopup = ({ onClose }) => {
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [tokenID, setTokenID] = useState('');

  useEffect(() => {
    fetchOwnedTokens();
  }, []);

  const fetchOwnedTokens = () => {
    getOwnedTokens()
      .then((response) => {
        setOwnedTokens(response.data);
      })
      .catch((error) => {
        console.log('Error fetching owned tokens:', error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    burnToken(tokenID)
      .then(() => {
        fetchOwnedTokens();
        setTokenID('');
      })
      .catch((error) => {
        console.log('Error burning token:', error);
      });
  };

  return (
    <div className="burn-popup">
            <div className="popup-header">
        <h1 className="transfer-page-title"style={{ fontFamily: 'Montserrat' }}>Burn NFT</h1>
        <button className="close-button" onClick={onClose}>
          x
        </button>
      </div>
      <div className="transfer-page-container">
        <div className="owned-tokens-container">
          <h2 className="form-heading">My Tokens</h2>
          {ownedTokens.length > 0 ? (
            <table className="owned-tokens-table">
              <thead>
                <tr>
                  <th>Token ID</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody>
                {ownedTokens.map((token) => (
                  <tr key={token.tokenID}>
                    <td>{token.tokenID}</td>
                    <td>{token.metadata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No tokens owned.</p>
          )}
        </div>
        <div className="transfer-form-container">
          <h2 className="form-heading">Burn Token</h2>
          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="form-field">
              <label htmlFor="tokenID" className="form-label">
                Token ID:
              </label>
              <input
                type="text"
                id="tokenID"
                value={tokenID}
                onChange={(event) => setTokenID(event.target.value)}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="transfer-button">Burn</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMintPopupOpen, setIsMintPopupOpen] = useState(false);
  const [isTransferPopupOpen, setTransferPopupOpen] = useState(false);
  const [isBurnPopupOpen, setIsBurnPopupOpen] = useState(false);

  const [data, setData] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    (async () => {
      const account = await getAccount();
      setAccount(account);
    })();
  }, []);

  const handleMintPopupToggle = () => {
    setIsMintPopupOpen(!isMintPopupOpen);
  };

  const handleTransferPopupToggle = () => {
    setTransferPopupOpen(!isTransferPopupOpen);
  };

  const handleBurnPopupToggle = () => {
    setIsBurnPopupOpen(!isBurnPopupOpen);
  };
  
  const onConnectWallet = async () => {
    await connectWallet();
    const account = await getAccount();
    setAccount(account);
  };

  const landLots = [
    { id: 1, image: 'https://e0.pxfuel.com/wallpapers/460/541/desktop-wallpaper-tanjiro-fire-mode.jpg' },
    { id: 2, image: 'https://wallpapers.com/images/featured/3tg32q5lcq0aaljj.jpg' },
    { id: 3, image: 'https://wallpapercrafter.com/desktop/138647-Kimetsu-no-Yaiba-anime-Mitsuri-Kanroji-cleavage-multicolored-hair-green-eyes-uniform-twintails-long-hair.jpg' },
    { id: 4, image: 'https://e1.pxfuel.com/desktop-wallpaper/466/936/desktop-wallpaper-kyojuro-rengoku-by-akhileshy10-rengoku-vs-akaza-thumbnail.jpg' },
    { id: 5, image: 'https://images2.alphacoders.com/121/1217745.png' },
    { id: 6, image: 'https://wallpapercrafter.com/desktop/358802-Anime-Demon-Slayer-Kimetsu-no-Yaiba-Phone-Wallpaper.jpg' },
    { id: 7, image: 'https://cdn.wallpapersafari.com/29/82/zZYmkM.png' },
    { id: 8, image: 'https://wallpapercave.com/wp/wp4934603.jpg' },
    { id: 9, image: 'https://rare-gallery.com/uploads/posts/327591-Sanemi-Shinazugawa-Kimetsu-no-Yaiba-4K-iphone-wallpaper.jpg' },
    { id: 10, image: 'https://static.displate.com/857x1200/displate/2021-09-28/8bca6cff2358ae58c211ab0eb59397b9_16bd59d22032d9a9ab2829465c54e644.jpg' },
    { id: 11, image: 'https://w0.peakpx.com/wallpaper/878/518/HD-wallpaper-tokito-muichiro-anime-anime-thumbnail.jpg' },
    { id: 12, image: 'https://w.forfun.com/fetch/ed/edb27dd8428cb1a435e72b7fcae344d0.jpeg' },
    { id: 13, image: 'https://e0.pxfuel.com/wallpapers/30/717/desktop-wallpaper-akaza-kimetsu-no-yaiba-edits-animes-artes-thumbnail.jpg' },
    { id: 14, image: 'https://w0.peakpx.com/wallpaper/500/176/HD-wallpaper-genya-shinazugawa-kimetsu-no-yaiba.jpg' },
    { id: 15, image: 'https://e1.pxfuel.com/desktop-wallpaper/838/403/desktop-wallpaper-hotaru-haganezuka-thumbnail.jpg' },
  ];

  return (
    <div className="homepage"> 
    
      {/* <button className="menu-button" onClick={handleMenuToggle}>
        Menu
      </button> */}
      <div className={`menu-panel ${isMenuOpen ? 'open' : ''}`}>
        <button className="menu-link" onClick={handleMintPopupToggle}>
          Mint
        </button>
        <button className="menu-link" onClick={handleTransferPopupToggle}>
          Transfer
        </button>
        <button className="menu-link" onClick={handleBurnPopupToggle}>
          Burn
        </button>
        
      </div>

      <div className="tab-bar">
      <h1 className="tab-title" style={{ fontFamily: 'Montserrat' }}>LOTNFT</h1>
        <button  onClick={onConnectWallet} className="btn btn-outline-info" >
          { account ? account : "CONNECT WALLET"}
        </button>
      </div>

      <div className="land-lots-container">
        {landLots.map((landLot) => (
          <div className="land-lot-wrapper" key={landLot.id}>
            <div className="land-lot-image-crop">
              <img
                src={landLot.image}
                alt={`Land Lot ${landLot.id}`}
                className="land-lot-image"
              />
            </div>
          </div>
        ))}
      </div>
      {isMintPopupOpen && <MintPopup onClose={handleMintPopupToggle} />}
      {isTransferPopupOpen && <TransferPopup onClose={handleTransferPopupToggle} />}
      {isBurnPopupOpen && <BurnPopup onClose={handleBurnPopupToggle} />}
    </div>
  );
};


export default Homepage;


