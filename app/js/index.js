import Web3 from "web3";
import blessedCoinArtifact from "../../build/contracts/BlessedCoinContract.json";
import fleek from '@fleekhq/fleek-storage-js';
import axios from "axios"

// Create a Javascript class to keep track of all the things
// we can do with our contract.
// Credit: https://github.com/truffle-box/webpack-box/blob/master/app/src/index.js
const App = {
    web3: null,
    account: null,
    blessedCoinArtifact: null,

    start: async function () {
        // Connect to Web3 instance.
        const { web3 } = this;

        try {
            // Get contract instance.
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = blessedCoinArtifact.networks[networkId];
            this.blessedCoinArtifact = new web3.eth.Contract(
                blessedCoinArtifact.abi,
                "0x28D8a6Ffea5d5E00085F7e078f4589Fe0c78F2e2",
            );
            console.log(deployedNetwork.address)

            // Get accounts and refresh the balance.
            const accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            this.refreshBalance();
        } catch (error) {
            console.error("Could not connect to contract or chain: ", error);
        }
    },

    refreshBalance: async function () {
        // Fetch the balanceOf method from our contract.
        const { balanceOf } = this.blessedCoinArtifact.methods;

        // Fetch shoutout amount by calling balanceOf in our contract.
        const balance = await balanceOf(this.account).call();

        // Update the page using jQuery.
        $('#balance').html(balance);
        $('#total-blessings').show();
        $('my-account').html(this.account);
    },

    storeMetadata: async function (name, to, blessing) {
        // Build the metadata.
        var metadata = {
            "name": name,
            "to": to,
            "blessings": [blessing],
            "timestamp": new Date().toISOString()
        };

        // Configure the uploader.
        const uploadMetadata = {
            apiKey: "+8ncjKS6QuD+SBTu8YObJw==",
            apiSecret: "2WoTeUr9AMyRLGGf7ajWdgrLV8rmy35OBk3rcccRjac=",
            key: `metadata/${metadata.timestamp}.json`,
            bucket: "shaunnnorton-team-bucket",
            data: JSON.stringify(metadata),
        };

        // Tell the user we're sending the shoutout.
        this.setStatus("Sending Blessing... please wait!");

        // Add the metadata to IPFS first, because our contract requires a
        // valid URL for the metadata address.
        const result = await fleek.upload(uploadMetadata);

        // Once the file is added, then we can send a shoutout!
        this.awardItem(to, result.publicUrl);
    },

    awardItem: async function (to, metadataURL) {
        // Fetch the awardItem method from our contract.
        const { awardItem } = this.blessedCoinArtifact.methods;

        // Award the shoutout.
        await awardItem(to, metadataURL).send({ from: this.account });

        // Set the status and show the metadata link on IPFS.
        this.setStatus(`Blessing sent! View the metadata <a href="${metadataURL}" target="_blank">here</a>.`);

        // Finally, refresh the balance (in the case where we send a shoutout to ourselves!)
        this.refreshBalance();
    },

    setStatus: function (message) {
        $('#status').html(message);
    },

    tradeBlessing: async function(name,to,blessing) {
        const { transferFrom } = this.blessedCoinArtifact.methods;
        const { balanceOf } = this.blessedCoinArtifact.methods;
        const { getLatestID } = this.blessedCoinArtifact.methods;
        const { tokenURI } = this.blessedCoinArtifact.methods;

        const balance = await balanceOf(this.account).call();
        const currentToken = await getLatestID().call()
        //console.log(currentToken);
        //await console.log(tokenURI(0).call())
        //await console.log(tokenURI(currentToken).call())
        if( balance > 0){
            let currentMetaData = await axios.get( await tokenURI(currentToken).call())
            let oldBlessings = currentMetaData.data.blessings
            console.log(oldBlessings)
           
            let newblessing = oldBlessings
            newblessing.push(blessing)

            var metadata = {
                "name": name,
                "to": to,
                "blessings": newblessing,
                "timestamp": new Date().toISOString()
            };
    
            // Configure the uploader.
            const uploadMetadata = {
                apiKey: "+8ncjKS6QuD+SBTu8YObJw==",
                apiSecret: "2WoTeUr9AMyRLGGf7ajWdgrLV8rmy35OBk3rcccRjac=",
                key: `metadata/${metadata.timestamp}.json`,
                bucket: "shaunnnorton-team-bucket",
                data: JSON.stringify(metadata),
            };
    
            // Tell the user we're sending the shoutout.
            this.setStatus("Sending Blessing... please wait!");
    
            // Add the metadata to IPFS first, because our contract requires a
            // valid URL for the metadata address.
            const result = await fleek.upload(uploadMetadata);
            await transferFrom(this.account, to,  currentToken, result.publicUrl).send({from: this.account})

            this.setStatus(`Blessing Traded! View the metadata <a href="${result.publicUrl}" target="_blank">here</a>.`);

            // Finally, refresh the balance (in the case where we send a shoutout to ourselves!)
            this.refreshBalance();
        }
    }
};

window.App = App;

// When all the HTML is loaded, run the code in the callback below.
$(document).ready(function () {
    // Detect Web3 provider.
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn("No web3 detected");
    }
    // Initialize Web3 connection.
    window.App.start();

    // Capture the form submission event when it occurs.
    $("#blessedcoin-form").submit(function (e) {
        // Run the code below instead of performing the default form submission action.
        e.preventDefault();

        // Capture form data and create metadata from the submission.
        const name = $("#from").val();
        const to = $("#to").val();
        const blessing = $("#blessing").val();

        window.App.storeMetadata(name, to, blessing);
    });

    $("#test-button").click(function () { 
        const name = $("#from").val();
        const to = $("#to").val();
        const blessing = $("#blessing").val();
        
        
        window.App.tradeBlessing(name,to,blessing);
    });
});