// setup
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
var accounts = web3.eth.accounts;
var compiled = web3.eth.compile.solidity(contractSource);

// populate select fields with our available accounts
accounts.forEach(function(v) {
    $("#supportFrom").append("<option val=\"" + v + "\">" + v + "</option>");
    $("#projectAddr").append("<option val=\"" + v + "\">" + v + "</option>");
});

// code is the binary representation of the compiled contract
var code = compiled.code;

// abi is the application binary interface of the contract
var abi = compiled.info.abiDefinition;

// contract is the contract template based on our abi
var contract = web3.eth.contract(abi);

// crowdfundingContract is the contract instance
var crowdfundingContract;

// parseCurrency parses a date return value from the contract
function parseDate(cb, f, prefix) {
    f(function(err, data) {
        if (!err && data) {
            cb(null, prefix + new Date(web3.toDecimal(data) * 1000));
        }
    });
}

// parseCurrency parses a currency return value from the contract
function parseCurrency(cb, f, prefix) {
    f(function(err, data) {
        if (!err && data) {
            cb(null, prefix + web3.fromWei(web3.toDecimal(data), 'ether') + ' ether');
        }
    });
}

// refreshData fetches data from the contract and displays it for the user
function refreshData() {
    console.log('refreshing data');
    $("#statuscontent").html("");
    var addr = crowdfundingContract.address;
    $("#statuscontent").append("Contract Address: " + addr);
    async.parallel([
        function(cb) { parseDate(cb, crowdfundingContract.deadlineProjects, "<b>Proposal Deadline:</b> "); },
        function(cb) { parseDate(cb, crowdfundingContract.deadlineCampaign, "<b>Campaign Deadline:</b> "); },
        function(cb) { parseCurrency(cb, crowdfundingContract.minimumEntryFee, "<b>Minimum Entry Fee:</b> "); },
    ], function(err, results) {
        if (err) {
            console.error(err);
        }
        if (results && results.length > 0 ) {
            results.forEach(function(result) {
                $("#statuscontent").append("<div>" + result + "</div>");
            });
        }
    });
}

$("#contractBtn").click(function() {
    var entryFee = web3.toWei($("#entryFeeContract").val(), 'ether');
    var proposalDeadline = $("#proposalDeadline").val();
    var campaignDeadline = $("#campaignDeadline").val();

    contract.new(entryFee, proposalDeadline, campaignDeadline, {
        from: web3.eth.accounts[0],
        data: code,
        gas: 4700000, // taken from browser solidity
    }, function(err, contr) {
        if (err) {
            console.error('there was an error: ' + err);
            return;
        }

        if (!contr.address) {
            console.log("Contract transaction sent: " + contr.transactionHash + " waiting to be mined...");
        } else {
            console.log("Contract mined! Address: " + contr.address);
            crowdfundingContract = contr;
            refreshData();
        }
    });
});

$("#submitBtn").click(function() {
    console.log('submitted!');
    // TODO: implement
});

$("#supportBtn").click(function() {
    console.log('supported!');
    // TODO: implement
});

$("#finishBtn").click(function() {
    console.log('finished!');
    // TODO: implement
});
