// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract MultiSig {
    address[] public owners;
    uint256 public required;
    uint public transactionCount;
    

    struct Transaction{
        address ady;
        uint256 value;
        bool executed;
        bytes data;
    }
    //state variables
    mapping(uint=>Transaction) public transactions;
    mapping(uint=>mapping(address=>bool)) public confirmations;
    mapping(uint=>uint) tx_confirmations;


    function isOwner(address _address) internal view returns (bool) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function isConfirmed(uint _txId) public view returns(bool) {
        return getConfirmationsCount(_txId) >= required;
    } 

    //Initialise the MultiSig
    constructor(address[] memory addresses, uint _required){
        require(addresses.length>0);
        require(_required>0 && _required<=addresses.length);
        for (uint i = 0; i < addresses.length; i++) {
            require(!isOwner(addresses[i]), "Owner not unique");
            owners.push(addresses[i]);
        }

        required=_required;
    }
    //functions

    function addTransaction(address _addr, uint256 value, bytes memory data) internal returns(uint256){
        require(isOwner(msg.sender), "Only owners can add transactions");
        transactions[transactionCount]=Transaction(_addr,value,false,data);
        transactionCount+=1;
        return(transactionCount-1);


    }

    function confirmTransaction(uint _txId) public {
        require(isOwner(msg.sender), "Only owners can confirm transactions");
        require(_txId < transactionCount, "Transaction does not exist");
        require(!transactions[_txId].executed, "Transaction already executed");
        require(!confirmations[_txId][msg.sender], "Transaction already confirmed by the owner");
        confirmations[_txId][msg.sender]=true;
        tx_confirmations[_txId]+=1;

        // if the tx is confirmed 
        if(isConfirmed(_txId)){
            executeTransaction(_txId);
        }

    }
    function getConfirmationsCount(uint transactionId ) public view returns(uint256){
        return(tx_confirmations[transactionId]);
    }

    function submitTransaction(address _destination, uint _value, bytes memory data) external {
    uint transactionId = addTransaction(_destination, _value, data);
    confirmTransaction(transactionId);
    }
    receive() external payable {}


    function executeTransaction(uint _txId) public {
        require(isConfirmed(_txId));
        transactions[_txId].executed=true;
        (bool success,)=transactions[_txId].ady.call{value:transactions[_txId].value}(transactions[_txId].data);
        require(success);

         if (!success) {
        // Revert the execution status if the call fails
        transactions[_txId].executed = false;
        revert("External call failed");
    }


    }
    
    }
