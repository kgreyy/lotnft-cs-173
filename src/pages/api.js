// api.js

// Mock data for owned tokens
const mockOwnedTokens = [
    { tokenID: 1, metadata: 'Token 1 metadata' },
    { tokenID: 2, metadata: 'Token 2 metadata' },
    { tokenID: 3, metadata: 'Token 3 metadata' },
  ];
  
  // Function to fetch the list of owned tokens
  export const getTokenList = () => {
    // Simulating an API call to fetch the list of owned tokens
    return new Promise((resolve, reject) => {
      // Simulating API delay
      setTimeout(() => {
        // Simulating successful API response
        resolve({ data: mockOwnedTokens });
      }, 1000);
    });
  };
  
  // Function to transfer a token
  export const transferToken = (destination, tokenID) => {
    // Simulating an API call to transfer the token
    return new Promise((resolve, reject) => {
      // Simulating API delay
      setTimeout(() => {
        // Simulating successful API response
        resolve();
      }, 1000);
    });
  };
  
  // Function to burn a token
  export const burnToken = (tokenID) => {
    // Simulating an API call to burn the token
    return new Promise((resolve, reject) => {
      // Simulating API delay
      setTimeout(() => {
        // Simulating successful API response
        resolve();
      }, 1000);
    });
  };

  // Function to fetch the list of owned tokens
  export const getOwnedTokens = () => {
    // Simulating an API call to fetch the list of owned tokens
    return new Promise((resolve, reject) => {
      // Simulating API delay
      setTimeout(() => {
        // Simulating successful API response
        resolve({ data: mockOwnedTokens });
      }, 1000);
    });
  };