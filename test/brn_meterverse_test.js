const BrnMeterverse = artifacts.require('BrnMeterverse');
const web3 = require('web3');

contract('BrnMeterverse',(accounts) =>{
    let brnMeterverse;

    beforeEach(async() => {
        brnMeterverse = await BrnMeterverse.deployed();
        [owner, alice, bob, inverster1, inverster2] = accounts;
    });

    describe("Meterverse Deployment", () => {
        it("BRN Meterverse gets deployed successfully", async() => {
            assert(brnMeterverse,"BRN Meterverse deployed successfully");
        });
    });

    describe("BRN Meterverse Transfers", () => {
        it("can successfuly enable BRN transfers from one address to another", async() => {
            const amount = 10;
            const initialOwnerBalance = await brnMeterverse.balanceOf(owner);
            console.log("Initial Owner Balance",initialOwnerBalance.toNumber());
            const result = await brnMeterverse.transfer(alice, amount, { from: owner });

            const aliceBalance = await brnMeterverse.balanceOf(alice);
            const newOwnerBalance = await brnMeterverse.balanceOf(owner);

            assert(result.receipt.status, true);
            assert.equal(aliceBalance, 10,"Meterverse is deposited successfully into other wallet address");
            assert(initialOwnerBalance < newOwnerBalance,"Owner balance reduces upon sending some meterverse tokens to another address");
            assert(result.logs[0].args.from, owner,"Sender addres is captured correctly");
            assert(result.logs[0].args.to, alice,"Receiver Address is captured correcty");
            assert(result.logs[0].args.value, 10,"BRN amount transfered captured correctly");
        });

        it("can successfuly enable a BRN holder to approve allowance to another address", async() => {
            const allowanceAmount = 1000;

            const currentOwnerAllowanceToAlice = await brnMeterverse.allowance(owner, alice);
            const result = await brnMeterverse.approve(alice, allowanceAmount, { from: owner });

            const newOwnerAllowanceToAlice = await brnMeterverse.allowance(owner, alice);

            assert(result.receipt.status, true);
            assert(newOwnerAllowanceToAlice > currentOwnerAllowanceToAlice ,"Alice\'s allowance approval from the BRN holder is a success");
            //test approval event
            assert(result.logs[0].args.owner, owner, "Approving address is captured correctly");
            assert(result.logs[0].args.spender, alice, "Spender Address is captured correcty");
            assert(result.logs[0].args.value, allowanceAmount);
        });

        it("can successfuly enable a BRN holder to increase the allowance issued to another address to be spent on their behalf", async() =>{
            const allowanceToBeAdded = 2000;
            const currentOwnerAllowanceToAlice = await brnMeterverse.allowance(owner, alice);

            const result = await brnMeterverse.increaseAllowance(alice, allowanceToBeAdded, { from: owner });
            const newAllowance = allowanceToBeAdded + currentOwnerAllowanceToAlice.toNumber();
            
            const newAllocatedBrnAllowanceToAlice = await brnMeterverse.allowance(owner, alice);

            assert(result.receipt.status, true);
            assert.equal(newAllowance, newAllocatedBrnAllowanceToAlice.toNumber(),"BRN allowance to spender successfully increased by BRN holder");
            //test Approval event
            assert(result.logs[0].args.owner, owner, "Approving address is captured correctly");
            assert(result.logs[0].args.spender, alice, "Spender Address is captured correcty");
            assert(result.logs[0].args.value, allowanceToBeAdded);
        });

        it("can successfuly enable a BRN holder to descrease the allowance issued to another address to be spent on their behalf", async () => {
            const allowanceToBeReduced = 2000;
            const currentOwnerAllowanceToAlice = await brnMeterverse.allowance(owner, alice);

            const result = await brnMeterverse.decreaseAllowance(alice, allowanceToBeReduced, { from: owner });
            const newAllowance = currentOwnerAllowanceToAlice.toNumber() - allowanceToBeReduced;

            const allowanceBalance = await brnMeterverse.allowance(owner, alice);

            assert(result.receipt.status, true);
            assert.equal(newAllowance, 1000, "BRN allowance to spender successfully deacreased by BRN holder");
            assert.equal(allowanceBalance.toNumber(), 1000);
            //test Approval event
            assert(result.logs[0].args.owner, owner, "Approving address is captured correctly");
            assert(result.logs[0].args.spender, alice, "Spender Address is captured correcty");
            assert(result.logs[0].args.value, allowanceToBeReduced);
        });

        it("can successfuly enable the BRN Meterverse contract owner to mint more BRN and increase BRN suppply", async() => {
            const newSupplyToBeAdded = 1000000000;
            const currentBRNTotalSupply = await brnMeterverse.totalSupply();
            const currentOwnerBRNBalance = await brnMeterverse.balanceOf(owner);
            const result = await brnMeterverse.mint(newSupplyToBeAdded, { from: owner} );
            
            const newTotalSupply = await brnMeterverse.totalSupply();
            const newOwnerBalance = await brnMeterverse.balanceOf(owner);

            const totalOwnerBalanceAfterMinting = newSupplyToBeAdded + currentOwnerBRNBalance.toNumber();
            
            const newSupply = newSupplyToBeAdded + currentBRNTotalSupply.toNumber();


            assert(result.receipt.status, true);
            assert.equal(newSupply, newTotalSupply,"BRN total Supply increased successfully after mint is triggered by contract owner");
            assert.equal(totalOwnerBalanceAfterMinting, newOwnerBalance.toNumber(),"BRN owner balance is increased after minting");
        });
    });


});