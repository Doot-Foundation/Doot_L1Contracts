// SPDX-License-Identifier:MIT

pragma solidity ^0.8.0;

enum TokenType {
  Native,
  ERC20
}

struct Order {
  uint256 selfId;
  uint256 amount;
  TokenType tokenType;
  address tokenAddress;
  bool fulfiled;
}

contract DootBarter {
  modifier onlyOwner() {
    if (msg.sender != owner) revert();
    _;
  }

  address public owner;
  mapping(address => string) public EthToMinaAddressBinding;
  mapping(address => Order[]) public userOrders;
  mapping(uint256 => Order) public order;
  Order[] public allOrders;

  address[] public validPaymentTokens;

  constructor(address[] memory paymentTokens) {
    validPaymentTokens = paymentTokens;
  }

  function _bytesToUint(
    bytes memory b
  ) internal pure virtual returns (uint256) {
    require(b.length <= 32, 'Bytes length exceeds 32.');
    return abi.decode(abi.encodePacked(new bytes(32 - b.length), b), (uint256));
  }

  function _generateOrderId(address sender) internal view returns (uint256) {
    return _bytesToUint(abi.encodePacked(sender, block.timestamp));
  }

  function open(address token, uint256 amount) external payable {
    address sender = msg.sender;
    uint256 orderId = _generateOrderId(sender);

    if (token == address(0)) {
      if (amount != msg.value) revert('Amount mismatch with value sent.');
    }

    TokenType toSetType = token == address(0)
      ? TokenType.Native
      : TokenType.ERC20;

    Order memory newOrder = Order({
      selfId: orderId,
      amount: amount,
      tokenType: toSetType,
      tokenAddress: token,
      fulfiled: false
    });

    order[orderId] = newOrder;
    userOrders[sender].push(newOrder);
    allOrders.push(newOrder);
  }

  function fulfill(uint256) external onlyOwner {}
}
