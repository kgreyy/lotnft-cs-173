import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { addBalanceOwnerOperation, addBalanceCounterpartyOperation, claimOwnerOperation, claimCounterpartyOperation, initiateAdminRefundOperation, initiateCounterpartyWithdrawOperation, initiateOwnerWithdrawOperation, finalizeAdminRefundOperation } from '../utils/operation';
import { contract_address } from '../utils/tezos';
import { wallet } from '../utils/wallet';
export function ContractInfo(props) {
    const [data, setData] = useState(null);
    
    useEffect(() => {
      axios.get('https://api.ghostnet.tzkt.io/v1/contracts/' + contract_address +'/storage')
        .then((response) => {
          setData(response.data);
          props.updateData(response.data);
        })
        .catch((error) => console.log(error));
    }, [props]);
    
    return (
      <div>
        {data ? (
          <div>
            <h3 align="center">Contract Details</h3>
            {Object.keys(data).map((key) => (
              <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {String(data[key])}</p>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
      }

export function AmountForm() {
  const [number, setNumber] = useState('');
  const [isOwner, setIsOwner] = useState(false); // new state for checkbox
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Amount submitted:', number);
    console.log('Is Owner:', isOwner); // log the checkbox value
    if(isOwner){
      await addBalanceOwnerOperation(number);
    }
    else{
      await addBalanceCounterpartyOperation(number);
    }
  };
  
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="numberInput">Enter an amount:</label>
          <input
            type="number"
            className="form-control"
            id="numberInput"
            placeholder="Enter an amount"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="isOwnerCheckbox"
            checked={isOwner}
            onChange={(e) => setIsOwner(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="isOwnerCheckbox">
            Send as Owner
          </label>
        </div>
        <button type="submit" className="btn btn-primary">Send amount</button>
      </form>
    </div>
  );
}

export function ClaimForm(props) {

  const handleOwnerClick = async() => {
    // Handle claim as owner button click
    console.log('Claim as owner button clicked');
    await claimOwnerOperation();
  };

  const handleCounterpartyClick = async() => {
    // Handle claim as counterparty button click
    console.log('Claim as counterparty button clicked');
    await claimCounterpartyOperation("0x01223344");
  };

  const handleOwnerWithdrawClick = async() => {
    console.log('Initiate owner withdraw button clicked');
    await initiateOwnerWithdrawOperation();
  };

  const handleCounterpartyWithdrawClick = async() => {
    console.log('Initiate counterparty withdraw button clicked');
    await initiateCounterpartyWithdrawOperation();
  };

  const handleAdminRefundClick = async() => {
    console.log('Initiate admin withdraw button clicked');
    await initiateAdminRefundOperation();
  };

  const handleFinalizeAdminRefundClick = async() => {
    console.log('Finalize admin withdraw button clicked');
    await finalizeAdminRefundOperation();
  };

  const getRole = () => {
    return props.account==props.data.owner ? "Owner": props.account==props.data.counterparty ? "Counterparty" : props.account==props.data.admin ? "Admin" : "No role in contract"
  }

  return (
    <div className="container">
      {props.data ? 
      (<div className="d-flex flex-column justify-content-center align-items-center">
        <h3>You are the {getRole()}!</h3>
        {
        {"Owner": (
        <div>
        <button disabled={props.data.ownerInit} onClick={handleOwnerClick} className="btn btn-primary mr-2">Claim as owner</button>
        <button disabled={(!props.data.adminInit || props.data.ownerInit)} onClick={handleOwnerWithdrawClick} className="btn btn-primary">Withdraw as owner</button>
        </div>
        ),
        "Counterparty": (
        <div>
        <button disabled={props.data.counterInit} onClick={handleCounterpartyClick} className="btn btn-primary">Claim as counterparty</button>
        <button disabled={!props.data.adminInit || props.data.counterInit} onClick={handleCounterpartyWithdrawClick} className="btn btn-primary">Withdraw as counterparty</button>
        </div>
        ),
        "Admin": (
        <div>
        <button disabled={props.data.adminInit} onClick={handleAdminRefundClick} className="btn btn-primary">Allow withdrawals</button>
        <button disabled={!(props.data.counterInit && props.data.ownerInit)} onClick={handleFinalizeAdminRefundClick} className="btn btn-primary">Finalize withdrawals</button>
        </div>
        )}[getRole()]
        }

      </div>
      )
      :
      (<p>Loading...</p>)
    }
    </div>
  );
}