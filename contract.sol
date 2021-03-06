pragma solidity ^0.4.6;

contract WinnerTakesAll {
    uint public minimumEntryFee;
    uint public deadlineProjects;
    uint public deadlineCampaign;
    function WinnerTakesAll(uint _minimumEntryFee, uint _durationProjects, uint _durationCampaign) public {
        if (_durationCampaign <= _durationProjects) {
            throw;
        }
        minimumEntryFee = _minimumEntryFee;
        deadlineProjects = now + _durationProjects* 1 seconds;
        deadlineCampaign = now + _durationCampaign * 1 seconds;
    }
    function submitProject(string name, string url) payable public returns (bool success) {
        return true;
    }
    function supportProject(address addr) payable public returns (bool success) {
        return true;
    }
    function finish() {
    }
}
