pragma solidity >=0.4.25;

contract UserList {
  struct User {
    bytes32 nick;
    bool isMale;
    // TODO: more in the future
  }

  mapping (address => User) public addrToUser;
  mapping (bytes32 => address) public nickToAddr;
  
  mapping (address => address[]) followList;

  function isAddrRegistered(address _who) public view returns(bool) {
    return addrToUser[_who].nick != 0;
  }

  function isNickRegistered(bytes32 _nick) public view returns(bool) {
    return nickToAddr[_nick] != address(0);
  }

  function register(bytes32 _nick, bool _isMale)  public {
    require(_nick != 0 && !isAddrRegistered(msg.sender) && !isNickRegistered(_nick));
    addrToUser[msg.sender] = User(_nick, _isMale);
    nickToAddr[_nick] = msg.sender;
  }

  function getUserByNick(bytes32 _nick) public view returns(address who, bool isMale) {
    who = nickToAddr[_nick];
    isMale = addrToUser[who].isMale;
  }

  function getUserByAddr(address who) public view returns(bytes32 nick, bool isMale) {
    User storage user = addrToUser[who];
    return (user.nick, user.isMale);
  }

  function getMe() public view returns(bytes32 nick, bool isMale) {
    return getUserByAddr(msg.sender);
  }

  function updateMe(bool _isMale) public {
    require(isAddrRegistered(msg.sender));
    addrToUser[msg.sender].isMale = _isMale;
  }


}
