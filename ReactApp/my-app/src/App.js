
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Web3 from 'web3';
import  _ from 'lodash'

var ETHEREUM_CLIENT = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

var peopleContractABI = [{"constant":true,"inputs":[],"name":"getPeople","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes32[]"},{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_firstName","type":"bytes32"},{"name":"_lastName","type":"bytes32"},{"name":"_age","type":"uint256"}],"name":"addPerson","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"people","outputs":[{"name":"firstName","type":"bytes32"},{"name":"lastName","type":"bytes32"},{"name":"age","type":"uint256"}],"payable":false,"type":"function"}];

var peopleContractAddress = '0xb65d7638f3d525b9dbe920b9f2b2e050f1a27214';

var peopleContract = ETHEREUM_CLIENT.eth.contract(peopleContractABI).at(peopleContractAddress);
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      firstNames: "",
      lastName: "",
      ages: ""
    }
  }

  componentWillMount() {

    console.log(peopleContract.getPeople());
    var data = peopleContract.getPeople();
  //  peopleContract.addPerson("Hamza", "ELYACHIOUI", 27);
    this.setState({
      firstNames: String(data[0]).split(","),
      lastNames: String(data[1]).split(","),
      ages: String(data[2]).split(",")
    })
  }
render() {
  var TableRows = []

  _.each(this.state.firstNames, (value, index) => {

    TableRows.push(
      <tr>
        <td>{ETHEREUM_CLIENT.toAscii(this.state.firstNames[index])}</td>
        <td>{ETHEREUM_CLIENT.toAscii(this.state.lastNames[index])}</td>
        <td>{this.state.ages[index]}</td>
      </tr>
    )

  })


    return (
      <div className="App">
        <div className="App-header">
        </div>
         <div className="App-content">
         <table>
          <thead>
            <tr>
              <th>First Name </th>
              <th>Last Name </th>
              <th>Age </th>
            </tr>
          </thead>
          <tbody>
            {TableRows}
          </tbody>
          </table>
    
        </div>
      </div>
    );
  }
}

export default App;

