import React, { Component } from 'react';
import logo from '../logo.png';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' })
//const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

class App extends Component {

  async componentWillMount() {
     await this.loadWeb3()
     await this.loadBlockchainData()
  }


  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData) {
      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi, address)
      this.setState({ contract: contract })
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })

    } else {
       window.alert('Smart contract not deployed to detected network!!')
    }
  }
   
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      buffer: null,
      contract: null,
      memeHash: "QmSU9m6q6RxMdMmL1AAmnhHNiiqsj2icy4B5MvssemhiQE"
    };
  }

  async loadWeb3(){
    if (window.ethereum) {
       window.web3 = new Web3(window.ethereum)
       await window.ethereum.enable()
    } if (window.web3) {
       window.web3 = new Web3(window.web3.currentProvider) 
    } else {
      window.alert('Please use metamask')
    }
  }

  captureFile=(event) => {
    event.preventDefault()
    console.log('file captured..')

   //IPFS processing... 
    const file=event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend= () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  onSubmit = (event) => {
   event.preventDefault()
   console.log("submitting the form...")

   const file=ipfs.add(this.state.buffer, (error,result) => {
     console.log('Ipfs result', result)
     if(error) {
        console.error(error)
        return
     }


   }).then(token => { 
       this.state.contract.methods.set(token["path"]).send({ from: this.state.account }).then((r) => {
          
          this.setState({memeHash:token["path"]}) 
         })
        


                    })
      
  }

  render() {
  console.log("hash: "+this.state.memeHash);
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            
            target="_blank"
            rel="noopener noreferrer"
          >
            <small className="text-white">Decentralized web server</small>
          </a>

          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white">{this.state.account}</small>
            </li>
          </ul>


        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={"http://127.0.0.1:8080/ipfs/"+this.state.memeHash} className="App-logo" alt="logo" />
                </a>
                <p>&nbsp;</p>
                <h2>Upload photo</h2>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile}/> 
                  <input type='submit'/>
                  </form>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
