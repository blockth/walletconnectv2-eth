import { useEffect, useState } from 'react';
import { SignClient } from '@walletconnect/sign-client';

import { Web3Modal } from '@web3modal/standalone';
import './App.css';

const web3modal = new Web3Modal({
  projectId: process.env.REACT_APP_PROJECT_ID,
  standaloneChains: ["eip155:5"]

})

function App() {
  
  const [signClient, setSignClient] = useState();


async function handleConnect(){
  if (!signClient) throw Error("Cannot connect. Sign client is not exists")
  try {
    /// dapp is going to send a proposal namespace
/// asking for the permissions
    const proposalNamespace = {
      eip155:{
        chains: ["eip155:5"],
        methods:["eth_sendTransaction"],
        events:["connect", "disconnect"]
      }
    }

    const {uri} = await signClient.connect({
      requiredNamespace: proposalNamespace})
      console.log(uri)

      if (uri) {
        web3modal.openModal({uri})
      }

  } catch (error) {
    console.log(error)
  }
}

  async function createClient(){

    try {
      const client = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID
      })
      console.log('client', client)
      setSignClient(client)
    } catch (error) {
      console.log(error)
    }
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
      <button onClick={handleConnect} disabled={!signClient}>
      Connect
      </button>
    </div>
  );
}

export default App;
