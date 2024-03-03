# MultiSig Contract

This Solidity smart contract implements a basic multi-signature wallet system on the Ethereum blockchain. It allows multiple owners to collectively manage a single wallet by requiring a specified number of owners to confirm transactions before they can be executed.

## Features

- Multiple owners can be added to the wallet.
- Each transaction requires a specified number of confirmations from the owners.
- Owners can submit and confirm transactions.
- Reentrant calls are mitigated to prevent reentrancy attacks.
- Daily withdrawal limits can be set for added security.

## Usage

1. Deploy the contract on the Ethereum blockchain.
2. Initialize the contract with a list of owner addresses and the required number of confirmations.
3. Use the `submitTransaction` function to submit a transaction.
4. Owners can confirm transactions using the `confirmTransaction` function.
5. Once the required number of confirmations is reached, the transaction can be executed.
6. Withdrawals are subject to the daily limit set by the contract.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
