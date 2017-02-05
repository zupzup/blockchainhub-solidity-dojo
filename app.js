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

function getAyncProjects(cb, f, prefix) {
    f(function(err, data) {
        if (!err && data) {
            var numProjects = web3.toDecimal(data);
            if (numProjects === 0) {
                cb(null, prefix + numProjects);
            } else {
                var indices = [];
                for(var i = 0; i<numProjects; i++) {
                    indices.push(i);
                }
                async.map(indices, function(i, cb) {
                    crowdfundingContract.projectAddresses(i, function(err, addr) {
                        if (!err) {
                            crowdfundingContract.getProjectInfo(addr, function(err, info) {
                                if (!err && info && info.length === 3) {
                                    var name = "<div>Name: " + info[0] + "</div>";
                                    var url = "<div>URL: " + info[1] + "</div>";
                                    var funds = "<div>Funds: " + web3.fromWei(web3.toDecimal(info[2]), 'ether') + "</div>";
                                    cb(null, addr + name + url + funds);
                                } else {
                                    cb(err, "");
                                }
                            });
                        } else {
                            cb(err, "");
                        }
                    });
                }, function(err, results) {
                    if (!err) {
                        cb(null, prefix + data + results.map(function(address) {
                            return "<div>" + address  + "<br /></div>";
                        }).join(""));
                    }
                });
            }
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
        function(cb) { getAyncProjects(cb, crowdfundingContract.numberOfProjects, "<b>Proposals:</b> "); },
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
        gas: 900000, // taken from browser solidity
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
    crowdfundingContract.submitProject.sendTransaction($("#projectName").val(), $("#projectURL").val(), {
        from: $("#projectAddr").val(),
        value: web3.toWei($("#entryFeeProject").val(), 'ether'),
        gas: 600000,
    }, function(err, data) {
        console.log(data);
        if (err) {
            console.error(err);
        }
        refreshData();
    });
});

$("#supportBtn").click(function() {
    console.log('supported!');
    crowdfundingContract.supportProject.sendTransaction($("#supportAddr").val(), {
        from: $("#supportFrom").val(),
        value: web3.toWei($("#supportAmount").val(), 'ether'),
        gas: 150000,
    }, function(err, data) {
        if (err) {
            console.error(err);
        }
        refreshData();
    });
});

$("#finishBtn").click(function() {
    console.log('finished!');
    crowdfundingContract.finish({from: web3.eth.accounts[0]}, function(err, data) {
        if (err) {
            console.error(err);
        }
        refreshData();
    });
});
