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

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}



// Contract code

async function main(){
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		const wallet = await buildWallet(Wallets, walletPath);
		await enrollAdmin(caClient, wallet, mspOrg1);
		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
		const gateway = new Gateway();

		const protocol = 'mqtt';
		const complete_host_URI = protocol.concat('://ds@research.upb.edu:21242');
		const client = mqtt.connect(complete_host_URI);

		//mqtt actions
		client.on('connect', function () {
			client.subscribe('register', function (err) {
				if (err) {
					console.log(err.message)
				}
			});
			client.subscribe('verify', function (err) {
				if (err) {
					console.log(err.message)
				}
			});
		});

		client.on('message', function(topic, message) {
			const outs = message.toString()
			if (topic === 'register') {
				console.log(outs)
				const json_msg = JSON.parse(outs)
				try {
					await gateway.connect(ccp, {
						wallet,
						identity: org1UserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});
					const network = await gateway.getNetwork(channelName);
			
					const contract = network.getContract(chaincodeName);
			
					console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, color, owner, size, and appraisedValue arguments');
					let result = await contract.submitTransaction('CreateAsset', json_msg['ID'], json_msg['Owner']);
					console.log('*** Result: committed');
					if (`${result}` !== '') {
						console.log(`*** Result: ${prettyJSONString(result.toString())}`);
					}
			
				} finally {
					gateway.disconnect();
				}
			}
			if (topic === 'verify') {
				const json_msg = JSON.parse(outs)
				console.log(outs)
				try {
					await gateway.connect(ccp, {
						wallet,
						identity: org1UserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});
					const network = await gateway.getNetwork(channelName);
			
					const contract = network.getContract(chaincodeName);
			
					console.log('\n--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID');
					let result = await contract.evaluateTransaction('ReadAsset', json_msg['ID']);
					console.log(`*** Result: ${prettyJSONString(result.toString())}`);
					client.publish('result', result.toString());
				} finally {
					gateway.disconnect();
				}
			}
		});

	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}
main();