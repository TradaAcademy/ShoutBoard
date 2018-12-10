pragma solidity >=0.4.25;

interface IUserList {
  function isAddrRegistered(address _who) external view returns(bool);
  function isNickRegistered(bytes32 _nick) external view returns(bool);
}

contract ShoutRoom {
  struct ShoutMsg {
    address who;
    string what;
  }

  ShoutMsg[] public shoutBoard;
  IUserList public userList;
  
  mapping(uint => address[]) public likers;

  event Shout(address indexed who, string what);

  function setUserList(IUserList _userList) public {
      userList = _userList;
  }

  function shout(string memory what) public {
    require(userList.isAddrRegistered(msg.sender));
    shoutBoard.push(ShoutMsg(msg.sender, what));
    emit Shout(msg.sender, what);
  }

  function count() view public returns(uint){
    return shoutBoard.length;
  }

  function getShouts() view public returns(address[] memory whoList, string memory content) {
    uint len = shoutBoard.length;
    bytes memory contentCollector;
    whoList  = new address[](len);
    for (uint i = 0; i < len; i++) {
      whoList[i] = shoutBoard[i].who;
      contentCollector = abi.encodePacked(contentCollector, shoutBoard[i].what, byte(0));
    }


    content = string(contentCollector);
  }

}
