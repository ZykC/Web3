var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("DNSRegistry error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("DNSRegistry error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("DNSRegistry contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of DNSRegistry: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to DNSRegistry.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: DNSRegistry not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "name": "ownedByIndex",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_dns",
            "type": "string"
          },
          {
            "name": "_to",
            "type": "address"
          }
        ],
        "name": "changeOwnership",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "ownedBy",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_dns",
            "type": "string"
          }
        ],
        "name": "getRegistered",
        "outputs": [
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_newDNSMarketAddress",
            "type": "address"
          }
        ],
        "name": "changeMarket",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "market",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_dns",
            "type": "string"
          }
        ],
        "name": "isRegistered",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numRegistered",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "registered",
        "outputs": [
          {
            "name": "dns",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_dns",
            "type": "string"
          }
        ],
        "name": "registerDNS",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_DNSMarketAddress",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "constructor"
      }
    ],
    "unlinked_binary": "0x60606040523461000057604051602080610ef783398101604052515b600060045560068054600160a060020a03808416600160a060020a0319928316179092556005805433909316929091169190911790555b505b610e94806100636000396000f300606060405236156100935763ffffffff60e060020a60003504166314e1b467811461009857806342ba518b146100c3578063438c56701461013557806352876935146101d15780635c3ef4271461024057806380f556051461025b5780638da5cb5b14610284578063c822d7f0146102ad578063c96e562714610314578063e6cf134614610333578063edd80cf6146103db575b610000565b34610000576100b1600160a060020a0360043516610442565b60408051918252519081900360200190f35b3461000057610121600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965050509235600160a060020a03169250610454915050565b604080519115158252519081900360200190f35b3461000057610151600160a060020a03600435166024356108a9565b604080516020808252835181830152835191928392908301918501908083838215610197575b80518252602083111561019757601f199092019160209182019101610177565b505050905090810190601f1680156101c35780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3461000057610224600480803590602001908201803590602001908080601f0160208091040260200160405190810160405280939291908181526020018383808284375094965061094a95505050505050565b60408051600160a060020a039092168252519081900360200190f35b3461000057610259600160a060020a03600435166109d5565b005b34610000576102246109f4565b60408051600160a060020a039092168252519081900360200190f35b3461000057610224610a03565b60408051600160a060020a039092168252519081900360200190f35b3461000057610121600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650610a1295505050505050565b604080519115158252519081900360200190f35b34610000576100b1610a96565b60408051918252519081900360200190f35b3461000057610343600435610a9c565b60408051600160a060020a03831660208201528181528354600260001961010060018416150201909116049181018290529081906060820190859080156103cb5780601f106103a0576101008083540402835291602001916103cb565b820191906000526020600020905b8154815290600101906020018083116103ae57829003601f168201915b5050935050505060405180910390f35b3461000057610121600480803590602001908201803590602001908080601f01602080910402602001604051908101604052809392919081815260200183838082843750949650610abd95505050505050565b604080519115158252519081900360200190f35b60036020526000908152604090205481565b600080805b600360006002876040518082805190602001908083835b6020831061048f5780518252601f199092019160209182019101610470565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820190942054600160a060020a0316855284019490945250016000205483101590506106d85761056e600060006002886040518082805190602001908083835b602083106105165780518252601f1990920191602091820191016104f7565b51815160209384036101000a60001901801990921691161790529201948552506040805194859003820190942054600160a060020a031685528481019590955250509081016000908120868252909252902086610d3d565b156106cc576020604051908101604052806000815250600060006002886040518082805190602001908083835b602083106105ba5780518252601f19909201916020918201910161059b565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902060009054906101000a9004600160a060020a0316600160a060020a0316600160a060020a0316815260200190815260200160002060008481526020019081526020016000209080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061067b57805160ff19168380011785556106a8565b828001600101855582156106a8579182015b828111156106a857825182559160200191906001019061068d565b5b506106c99291505b808211156106c557600081556001016106b1565b5090565b50505b5b600190910190610459565b5060005b60045481101561073b5760008181526001602052604090206106fe9086610d3d565b15610732576000908152600160208190526040909120018054600160a060020a031916600160a060020a0385161790556004545b5b6001016106dc565b836002866040518082805190602001908083835b6020831061076e5780518252601f19909201916020918201910161074f565b518151600019602094850361010090810a82019283169219939093169190911790925294909201968752604080519788900382019097208054600160a060020a03998a16600160a060020a0319909116179055968b1660009081528088528681206003895287822054825288529586208c518154828952978990209198601f600260018b16159097029094019098169490940482018790048101969395509350918b0191849010905061082c57805160ff1916838001178555610859565b82800160010185558215610859579182015b8281111561085957825182559160200191906001019061083e565b5b5061087a9291505b808211156106c557600081556001016106b1565b5090565b5050600160a060020a03841660009081526003602052604090208054600190810190915592505b505092915050565b60006020818152928152604080822084529181528190208054825160026001831615610100026000190190921691909104601f8101859004850282018501909352828152929091908301828280156109425780601f1061091757610100808354040283529160200191610942565b820191906000526020600020905b81548152906001019060200180831161092557829003601f168201915b505050505081565b600061095582610a12565b156109cb576002826040518082805190602001908083835b6020831061098c5780518252601f19909201916020918201910161096d565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054600160a060020a031692506109cf915050565b5060005b5b919050565b60068054600160a060020a031916600160a060020a0383161790555b50565b600654600160a060020a031681565b600554600160a060020a031681565b60006002826040518082805190602001908083835b60208310610a465780518252601f199092019160209182019101610a27565b51815160209384036101000a6000190180199092169116179052920194855250604051938490030190922054600160a060020a03161591506109cb9050575060016109cf565b5060005b5b919050565b60045481565b600160208190526000918252604090912090810154600160a060020a031682565b6000610ac882610a12565b15610ad257610000565b336002836040518082805190602001908083835b60208310610b055780518252601f199092019160209182019101610ae6565b6001836020036101000a038019825116818451168082178552505050505050905001915050908152602001604051809103902060006101000a815481600160a060020a030219169083600160a060020a0316021790555060406040519081016040528083815260200133600160a060020a03168152506001600060045481526020019081526020016000206000820151816000019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610be257805160ff1916838001178555610c0f565b82800160010185558215610c0f579182015b82811115610c0f578251825591602001919060010190610bf4565b5b50610c309291505b808211156106c557600081556001016106b1565b5090565b505060209182015160019182018054600160a060020a031916600160a060020a039283161790556004805483019055331660009081528083526040808220600385528183205483528452812085518154828452928590209194600261010095851615959095026000190190931693909304601f90810183900482019392870190839010610cc857805160ff1916838001178555610cf5565b82800160010185558215610cf5579182015b82811115610cf5578251825591602001919060010190610cda565b5b50610d169291505b808211156106c557600081556001016106b1565b5090565b5050600160a060020a0333166000908152600360205260409020805460010190555b919050565b6040805160208101909152600090819052815183548491849184916002600019610100600185161502019092169190910414610d7c5760009350610e5f565b5060005b825460026000196101006001841615020190911604811015610e5a57818181518110156100005790602001015160f860020a900460f860020a027effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191683828154600181600116156101000203166002900481101561000057815460011615610e175790600052602060002090602091828204019190065b9054901a60f860020a027fff000000000000000000000000000000000000000000000000000000000000001614610e515760009350610e5f565b5b600101610d80565b600193505b505050929150505600a165627a7a723058201742d23e57674a89db17143d49f2b4d963288b5d215c36134820c2b21e475a080029",
    "events": {},
    "updated_at": 1484681112131,
    "links": {},
    "address": "0xca9f5c4cc7df445215597f0f9f8f4aa45d0895ff"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "DNSRegistry";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.DNSRegistry = Contract;
  }
})();
