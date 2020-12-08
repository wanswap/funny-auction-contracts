// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20("Test Token", "TT"), Ownable {
    constructor() public {
        _mint(msg.sender, 1000000000 ether);
    }
}
