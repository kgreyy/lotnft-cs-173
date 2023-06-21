// TODO 1 - Setup Tezos Toolkit
import { TezosToolkit } from '@taquito/taquito';
import { wallet } from './wallet';


export const tezos = new TezosToolkit("https://ghostnet.smartpy.io")

// TODO 3 - Specify wallet provider for Tezos instance

tezos.setProvider({wallet});

export const contract_address = "KT1B25gAspPvA2e2o8yXfK9iiGkNf4UtdikA";
