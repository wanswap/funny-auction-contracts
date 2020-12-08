// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FunnyAuction is ERC20("Auction Liquidity Pool Token", "ALT"), Ownable {
    using SafeMath for uint256;

    uint256 public highestValue;
    uint256 public coldDownBlock;
    uint256 public confirmBlock;

    uint256 public liquidityPool;
    uint256 public lastOfferBlock;
    uint256 public currentGoodValue;
    uint256 public currentBidPrice;
    address payable public topPlayer;
    address public secondPlayer;
    address public waspToken;

    address[] public currentPlayers;

    mapping(address => uint256) bidMap;
    mapping(address => uint256) assetMap;

    event Offer(address indexed user, uint256 value);

    event Claim(address indexed user, uint256 value);

    event Prize(address indexed user, uint256 value);

    event Withdraw(address indexed user, uint256 value);

    event GameFinish(address indexed top1, address indexed top2, uint256 prize);

    /// @dev get current game status
    /// 0:idle, 1:coldDown, 2:bidding
    function getStatus() public view returns (uint256) {
        uint256 past = block.number - lastOfferBlock;
        if (past < confirmBlock) {
            return 2;
        }

        if (past >= confirmBlock && past < (confirmBlock + coldDownBlock)) {
            return 1;
        }

        return 0;
    }

    /// @dev offer a new price for goods.
    function offer(uint256 value) external payable {
        uint256 status = getStatus();
        require(status != 1, "It is colding down");
        require(value % 1 ether == 0, "Must input integer");
        require(value > 0, "Must larger than 0");
        require(
            assetMap[msg.sender] + bidMap[msg.sender] + IERC20(waspToken).balanceOf(msg.sender) >= value,
            "Assets not enough"
        );
        require(msg.value == 0, "Please do not send WAN.");

        // last round finish
        if (status == 0) {
            settlement();
            status = 2;
        }

        // biding
        if (status == 2) {
            require(value - currentBidPrice >= 1 ether, "Price too low");
            require(
                value > bidMap[msg.sender],
                "New price must larger than old"
            );
            uint256 pay = value - bidMap[msg.sender];
            // use wan from assets
            if (assetMap[msg.sender] >= pay) {
                assetMap[msg.sender] = assetMap[msg.sender].sub(pay);
            } else {
                IERC20(waspToken).transferFrom(msg.sender, address(this), pay);
            }
            
            if (bidMap[msg.sender] == 0) {
                currentPlayers.push(msg.sender);
            }

            bidMap[msg.sender] = bidMap[msg.sender].add(pay);
            currentBidPrice = bidMap[msg.sender];
            secondPlayer = topPlayer;
            topPlayer = msg.sender;
            lastOfferBlock = block.number;
            emit Offer(msg.sender, value);
        }
    }

    function calcGoodsValue() public view returns (uint256) {
        if (liquidityPool >= highestValue) {
            return highestValue;
        }
        return 0;
    }

    function getPlayersInfo()
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        address[] memory addrs = new address[](currentPlayers.length);
        uint256[] memory bids = new uint256[](currentPlayers.length);

        for (uint256 i = 0; i < currentPlayers.length; i++) {
            addrs[i] = currentPlayers[i];
            bids[i] = bidMap[currentPlayers[i]];
        }

        return (addrs, bids);
    }

    /// @dev claim user's wan back
    function claim() external {
        uint256 amount = assetMap[msg.sender];
        assetMap[msg.sender] = 0;
        if (amount > 0) {
            IERC20(waspToken).transfer(msg.sender, amount);
            emit Claim(msg.sender, amount);
        }
    }

    /// @dev deposit wans get ALT (Auction Liquidity Pool Token)
    receive() external payable {
        liquidityPool = liquidityPool.add(msg.value);
        currentGoodValue = calcGoodsValue();
        _mint(msg.sender, msg.value);
    }

    /// @dev send ALT get wans back
    function withdraw() external {
        uint256 altBalance = balanceOf(msg.sender);
        require(altBalance > 0, "not enough ALT");
        uint256 payAmount = (liquidityPool * altBalance) / totalSupply();

        liquidityPool = liquidityPool.sub(payAmount);
        _burn(msg.sender, altBalance);
        msg.sender.transfer(payAmount);
        emit Withdraw(msg.sender, payAmount);
    }

    function config(
        uint256 _highestValue,
        uint256 _coldDownBlock,
        uint256 _confirmBlock,
        address _waspToken
    ) external onlyOwner {
        highestValue = _highestValue;
        coldDownBlock = _coldDownBlock;
        confirmBlock = _confirmBlock;
        waspToken = _waspToken;
    }

    function settlement() public {
        uint256 status = getStatus();
        require(status == 0, "settlement must wait for bid finsih.");

        for (uint256 i = 0; i < currentPlayers.length; i++) {
            if (currentPlayers[i] == topPlayer) {
                liquidityPool = liquidityPool.sub(currentGoodValue);
                IERC20(waspToken).transfer(address(1), bidMap[topPlayer]); //burn;
                bidMap[topPlayer] = 0;
                topPlayer.transfer(currentGoodValue);
                emit Prize(topPlayer, currentGoodValue);
                continue;
            }

            assetMap[currentPlayers[i]] = assetMap[currentPlayers[i]].add(
                bidMap[currentPlayers[i]]
            );
            bidMap[currentPlayers[i]] = 0;
        }
        // clear players
        delete currentPlayers;
        emit GameFinish(topPlayer, secondPlayer, currentGoodValue);
        topPlayer = address(0);
        secondPlayer = address(0);
        currentBidPrice = 0;
        currentGoodValue = calcGoodsValue();
    }
}
