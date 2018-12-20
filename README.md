# ShoutBoard

## Prerequisite
1. Install [NodeJS](https://nodejs.org)
2. Install Truffle `npm install -g truffle`
3. Install [Ganache](https://truffleframework.com/ganache)
4. Install [Metamask browser plugin](https://metamask.io/)

## Config
1. Start **Ganache**
2. Metamask > Import account using seed phase
3. Paste Ganache's MNEMONIC into seed field, type any password
4. Metamask > Settings > New Network: HTTP://127.0.0.1:7545
5. Metamask > Change network to private network
6. Metamask > Create 3 accounts (each should have 100 ETH) 

## Setup
1. clone repo
2. `npm install`

## Build

Make sure Ganache is running.

1. `truffle compile`
2. `truffle migrate`

## Run
`npm start`

- If Metamask display "loading" forever: disable Metamask extension then re-enable it!
- If transaction error, try **MetaMask > Settings > Reset Account**.