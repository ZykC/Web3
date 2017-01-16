contract DNSMarket {
    struct Sale {
        string dns;
        address seller;
        uint price;
    }

    mapping (uint => Sale) public sales;
    uint public nextSaleId = 0;
    address public owner;

    DNSRegistry private dnsRegistry;

    function DNSMarket(address _DNSRegistryAddress) {
        dnsRegistry = DNSRegistry(_DNSRegistryAddress);
        owner = msg.sender;
    }

    function changeRegistry(address _newDNSRegistryAddress) {
        dnsRegistry = DNSRegistry(_newDNSRegistryAddress);
    }

    modifier isDNSOwner(string _dns) {
        if (dnsRegistry.getRegistered(_dns) != msg.sender) {
            throw;
        }
        else{
            _
            }
        
    }

    function sell(string _dns, uint price) isDNSOwner(_dns) {
        sales[nextSaleId] = Sale(_dns, msg.sender, price);
        nextSaleId++;
    }

    function buy(uint _saleId) payable {
        if (sales[_saleId].seller == 0) throw;
        if (msg.value < sales[_saleId].price) throw;

        sales[_saleId].seller.send(sales[_saleId].price);

        // transfer ownership of DNS
        dnsRegistry.changeOwnership(sales[_saleId].dns, msg.sender);

        delete sales[_saleId];
    }
}

contract DNSRegistry {
    struct DNS {
        string dns;
        address owner;
    }

    mapping (address => mapping (uint => string)) public ownedBy;
    mapping (uint => DNS) public registered;
    mapping (string => address) registeredTo;
    mapping (address => uint) public ownedByIndex;

    uint public numRegistered;
    address public owner;
    address public market;

    modifier onlyMarket {
        if (msg.sender != market) {
            throw;
        }
        _
    }

    function DNSRegistry(address _DNSMarketAddress) {
        numRegistered = 0;
        market = _DNSMarketAddress;
        owner = msg.sender;
    }

    function changeMarket(address _newDNSMarketAddress) {
        market = _newDNSMarketAddress;
    }

    function registerDNS(string _dns) returns (bool success) {
        if (isRegistered(_dns)) {
            throw;
        }

        registeredTo[_dns] = msg.sender;

        registered[numRegistered] = DNS(_dns, msg.sender);
        numRegistered++;

        ownedBy[msg.sender][ownedByIndex[msg.sender]] = _dns;
        ownedByIndex[msg.sender]++;
    }

    function isRegistered(string _dns) returns (bool success) {
        if (registeredTo[_dns] != 0) {
            success = true;
        } else {
            success = false;
        }
    }

    function getRegistered(string _dns) returns (address owner) {
        if (isRegistered(_dns)) {
            owner = registeredTo[_dns];
        } else {
            owner = 0;
        }
    }

    function changeOwnership(string _dns, address _to) returns (bool success) {
        // remove ownership from current owner
        for (uint y = 0; y < ownedByIndex[registeredTo[_dns]]; y++) {
            if (stringsEqual(ownedBy[registeredTo[_dns]][y], _dns)) {
                ownedBy[registeredTo[_dns]][y] = "";
            }
        }

        for (uint i = 0; i < numRegistered; i++) {
            if (stringsEqual(registered[i].dns, _dns)) {
                registered[i].owner = _to;
                i = numRegistered;
            }
        }

        registeredTo[_dns] = _to;

        ownedBy[_to][ownedByIndex[_to]] = _dns;
        ownedByIndex[_to]++;

        return true;
    }

    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
		if (a.length != b.length)
			return false;
		// @todo unroll this loop
		for (uint i = 0; i < a.length; i ++)
			if (a[i] != b[i])
				return false;
		return true;
	}
}
