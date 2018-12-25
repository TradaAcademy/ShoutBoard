pragma solidity >=0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

interface IUserList {
    function isAddrRegistered(address _who) external view returns(bool);
    function isNickRegistered(bytes32 _nick) external view returns(bool);
}

contract ShoutRoom is Ownable {
    struct ShoutMsg {
        address who;
        string what;
    }

    ShoutMsg[] public shoutBoard;
    IUserList public userList;
    
    mapping(uint => address[]) public likers;

    event Shout(address indexed who, string what);

    constructor(IUserList _userList) public {
        userList = _userList;
    }

    function setUserList(IUserList _userList) public onlyOwner {
        userList = _userList;
    }

    function shout(string memory what) public {
        require(bytes(what).length != 0, "Content cannot be blank");
        require(address(userList) != address(0), "UserList not set");
        //require(userList.isAddrRegistered(msg.sender), "User not registered");
        shoutBoard.push(ShoutMsg(msg.sender, what));
        emit Shout(msg.sender, what);
    }

    function count() public view returns(uint){
        return shoutBoard.length;
    }

    function getShouts() public view returns(address[] memory whoList, string memory content) {
        uint len = shoutBoard.length;
        bytes memory contentCollector;
        whoList = new address[](len);
        for (uint i = 0; i < len; i++) {
            whoList[i] = shoutBoard[i].who;
            contentCollector = abi.encodePacked(contentCollector, shoutBoard[i].what, byte(0));
        }

        content = string(contentCollector);
    }

}
