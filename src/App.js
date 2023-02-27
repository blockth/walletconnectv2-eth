import { useEffect, useState } from 'react';
import { SignClient } from '@walletconnect/sign-client';

import { Web3Modal } from '@web3modal/standalone';
import './App.css';

const web3Modal = new Web3Modal({
  projectId: process.env.REACT_APP_PROJECT_ID,
  standaloneChains: ["eip155:5"]

})

function App() {
  
const [signClient, setSignClient] = useState();

const [session, setSession] = useState([]);

const [account, setAccount] = useState([]);

const [txnHash, setTxnHash] = useState();

async function createClient(){

  try {
    const client = await SignClient.init({
      projectId: process.env.REACT_APP_PROJECT_ID
    })
    console.log('client', client)
    setSignClient(client)
    await subscribeToEvents(client)
  } catch (error) {
    console.log(error)
  }
}


async function handleConnect(){
  if (!signClient) throw Error("Cannot connect. Sign client is not exists")
  try {
    const proposalNamespace = {
      eip155: {
          methods: ["eth_sendTransaction"],
          chains: ["eip155:5"],
          events: ["connect", "disconnect"]
        },
      };

    const {uri, approval} = await signClient.connect({
      requiredNamespaces: proposalNamespace,})
      // console.log(uri)

      if (uri) {
        web3Modal.openModal({uri});
        const sessionNamespace = await approval();
        // console.log('sessionNamespace')
        onSessionConnect(sessionNamespace)
        web3Modal.closeModal();
      }

  } catch (error) {
    console.log(error)
  }
}

async function onSessionConnect(session){
  if(!session) throw Error("Client doesn't exist")

  try {
    setSession(session);
    setAccount(session.namespaces.eip155.accounts[0].slice(9)); 
  } catch (error) {
    console.log(error)
  }
}


async function handleDisconnect(){
  try {
    await signClient.disconnect({
      topic: session.topic,
      code: 6000,
      message:"User disconnected"
    })
    reset();
  } catch (error) {
    console.log(error)
  }
}


async function subscribeToEvents(client){
  if(!client) throw Error("No events to subscribe")

  try {
    client.on("session_delete", () => {
      console.log("user disconnected the session");
      reset()
    })
  } catch (error) {
    console.log.error()
  }
}


async function handleSend(){
try {
  //create the transaction parameters
  // send this transaction
  // result // txn url
  const trx = {
      from: account,
      to: "0xf8050Ec6CdE55153a2646A6eb305Daf0e10E44bA",
      data: "0x",
      gasPrice: "0x029104e28c",
      gasLimit: "0x5208",
      value: "0x00",
  
  };

  const result = await signClient.request({
    topic: session.topic,
    request: {
      method: "eth_sendTransaction",
      params: [trx]
    },
    chainId: "eip155:5"
})

setTxnHash(result)

} catch (error) {
  
}
}

const reset = () =>  {
  setAccount([]);
  setSession([]);
}

  useEffect(() => {
    if (!signClient){
      createClient();
    }
  }, [signClient]);


  return (
    <div className="App">
      <h1> 
        WC Tutorial
      </h1> 
      {account.length ? (
          <>
          <p> {account}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
          <button onClick={handleSend}>Send</button>
          { txnHash && <p>View your transaction <a href={`https://goerli.etherscan.io/tx/${txnHash}`} target="_blank" rel="noreferrer">here</a>!</p>}
        
          </>
          ): (
          
          <button onClick={handleConnect} disabled={!signClient}>
          Connect
          </button>
        )}
    
    </div>
  );
}

export default App;
