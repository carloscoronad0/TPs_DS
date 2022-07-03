/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const mqtt = require('mqtt')
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

const protocol = 'mqtt'
const complete_host_URI = protocol.concat('://ds@research.upb.edu:21242')

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

const client = mqtt.connect(complete_host_URI)

// Contract code
var gateway = null;
async function main(){
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		return new Gateway();
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		return null
	}
}
gateway = main();
//mqtt actions
client.on('connect', function () {
	client.subscribe('/register', function (err) {
		if (err) {
			console.log(err.message)
		}
	});
	client.subscribe('/verify', function (err) {
		if (err) {
			console.log(err.message)
		}
	});
});

client.on('message', function(topic, message) {
	if (topic === '/register') {
		json_msg = JSON.parse(message)
		register(gateway,json_msg);
	}
	if (topic === '/verify') {
		json_msg = JSON.parse(message)
		verify(gateway,json_msg);
	}
});

async function register(gateway,msg) {
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});
		const network = await gateway.getNetwork(channelName);

		const contract = network.getContract(chaincodeName);

		// console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
		// let result = await contract.evaluateTransaction('GetAllAssets');
		// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
		result = await contract.submitTransaction('CreateAsset', msg['ID'], 'yellow', '5', msg['Owner'], '1300');
		console.log('*** Result: committed');
		if (`${result}` !== '') {
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		}

		// console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
		// result = await contract.evaluateTransaction('ReadAsset', 'asset13');
		// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	} finally {
		gateway.disconnect();
	}	
}
async function verify(gateway,msg) {
	try {
		await gateway.connect(ccp, {
			wallet,
			identity: org1UserId,
			discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
		});
		const network = await gateway.getNetwork(channelName);

		const contract = network.getContract(chaincodeName);

		// console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
		// let result = await contract.evaluateTransaction('GetAllAssets');
		// console.log(`*** Result: ${prettyJSONString(result.toString())}`);

		// console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
		// result = await contract.submitTransaction('CreateAsset', msg['ID'], 'yellow', '5', msg['Owner'], '1300');
		// console.log('*** Result: committed');
		// if (`${result}` !== '') {
		// 	console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		// }

		console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
		result = await contract.evaluateTransaction('ReadAsset', msg['ID']);
		console.log(`*** Result: ${prettyJSONString(result.toString())}`);

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	} finally {
		gateway.disconnect();
	}	
}
