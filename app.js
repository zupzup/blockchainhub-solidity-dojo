var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
var accounts = web3.eth.accounts;

accounts.forEach(function(v) {
    $("#supportFrom").append("<option val=\"" + v + "\">" + v + "</option>");
    $("#projectAddr").append("<option val=\"" + v + "\">" + v + "</option>");
});

var compiled = web3.eth.compile.solidity(contractSource);

var code = compiled.code;
var abi = compiled.info.abiDefinition;

var contract = web3.eth.contract(abi);

var crowdfunder;

$("#contractBtn").click(function() {
});

$("#submitBtn").click(function() {
});

$("#supportBtn").click(function() {
});

$("#finishBtn").click(function() {
});
