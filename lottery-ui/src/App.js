import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const ethers = require('ethers');

class App extends Component {
  state = {
    liveEntryEvents: [],
    name: '',
    ethValue: ''
  };

  async componentDidMount() {
    await window.ethereum.enable();
    window.provider = new ethers.providers.Web3Provider(window.ethereum);
    window.lotteryContractInstance = new ethers.Contract(
      '0x7fd7dC86e22F28F756b47c3AAa21392Dda9F5321',
      [{"inputs":[],"name":"endLottery","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"enterLottery","outputs":[],"stateMutability":"payable","type":"function"},{"anonymous":!1,"inputs":[{"indexed":!1,"internalType":"address","name":"_userAddress","type":"address"},{"indexed":!1,"internalType":"uint256","name":"_amount","type":"uint256"},{"indexed":!1,"internalType":"uint256","name":"_indexInArray","type":"uint256"}],"name":"NewEntry","type":"event"},{"anonymous":!1,"inputs":[{"indexed":!1,"internalType":"uint256","name":"_winningIndex","type":"uint256"}],"name":"Winner","type":"event"},{"inputs":[],"name":"endTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"entries","outputs":[{"internalType":"address","name":"userAddress","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_seed","type":"uint256"}],"name":"generateRandomNumber","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNumberOfEntries","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}],
      (window.provider).getSigner()
    );

    const logParser = log => {
      const address = '0x'+log.data.slice(26,66);
      const amount = ethers.utils.bigNumberify('0x'+log.data.slice(66,66+64));
      const index = Number('0x' + log.data.slice(2+64*2,2+64*3));
      return {address, amount, index}
    }

    window.provider.on({
      address: '0x7fd7dC86e22F28F756b47c3AAa21392Dda9F5321',
      topics: [ethers.utils.id('NewEntry(address,uint256,uint256)')]
    }, obj => {
      const parsedObj = logParser(obj);
      const liveEntryEvents = [...this.state.liveEntryEvents];

      liveEntryEvents.push(parsedObj);

      this.setState({ liveEntryEvents });
    });



    // const parsedLogs = (await window.provider.getLogs({
    //   address: '0x660013682C34146CF98bc6e7f3509fAE1B1E45FB',
    //   fromBlock: 0,
    //   toBlock: 'latest',
    //   topics: [ethers.utils.id('NewEntry(address,uint256,uint256)')]
    // }))
    // .map(logParser);
    //
    // console.log({parsedLogs});

    // this.setState({ liveEntryEvents: parsedLogs });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Lottery Decentralised Application
          </p>

          <input type="text" placeholder="enter your name" onChange={event => this.setState({ name: event.target.value })} />
          <input type="text" placeholder="enter amount of ether" onChange={event => this.setState({ ethValue: event.target.value })} />
          <button onClick={() => {
            window.lotteryContractInstance.functions.enterLottery(this.state.name, {value: ethers.utils.parseEther(this.state.ethValue.split(' ').join(''))});
          }}>Enter Lottery</button>

          {this.state.liveEntryEvents.map((details,i) => (
            <EntryElement key={i} details={details} />
          ))}
        </header>
      </div>
    );
  }
}

class EntryElement extends Component {
  state = {
    name: null
  }

  componentDidMount = async() => {
    try {
      const entry = await window.lotteryContractInstance.functions.entries(this.props.details.index);

      console.log({entry});

      this.setState({ name: entry.name });
    } catch(error) {
      console.log(error.message);
    }
  }

  render() {
    return (
      <div style={{border:'1px #fff solid'}}>
        <p>Address: {this.props.details.address}</p>
        <p>Amount: {ethers.utils.formatEther(this.props.details.amount)} ETH</p>
        <p>Index: {this.props.details.index}</p>
        {this.state.name ? <p>Name: {this.state.name}</p> : null}
      </div>
    )
  }
}

export default App;
