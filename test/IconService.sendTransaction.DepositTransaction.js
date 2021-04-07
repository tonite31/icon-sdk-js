import assert from 'assert';
import IconService, { HttpProvider, SignedTransaction, IconValidator, IconWallet, IconBuilder, IconConverter, IconAmount } from '../build/icon-sdk-js.node.min';
import DeployContent from './mock/DeployContent.json'
const { DeployTransactionBuilder, DepositTransactionBuilder } = IconBuilder;
const iconService = new IconService(new HttpProvider('https://bicon.net.solidwallet.io/api/v3'));
const wallet = IconWallet.loadPrivateKey('38f792b95a5202ab431bfc799f7e1e5c74ec0b9ede5c6142ee7364f2c84d72f6')

const from = 'hx902ecb51c109183ace539f247b4ea1347fbf23b5';
const to = 'cx0000000000000000000000000000000000000000';
const stepLimit = IconConverter.toBigNumber(2500000000);
const nid = IconConverter.toBigNumber(3);
const nonce = IconConverter.toBigNumber(1);
const version = IconConverter.toBigNumber(3);
const timestamp = (new Date()).getTime() * 1000;
const params = {
	initialSupply: IconConverter.toHex(IconConverter.toBigNumber('100000000000')),
	decimals: IconConverter.toHex(IconConverter.toBigNumber('18')),
	name: 'StandardToken',
	symbol: 'ST',
};
const transactionToInstall = new DeployTransactionBuilder()
	.from(from)
	.to(to)
	.stepLimit(stepLimit)
	.nid(nid)
	.nonce(nonce)
	.version(version)
	.timestamp(timestamp)
	.contentType('application/zip')
	.content(DeployContent.install)
	.params(params)
	.build();

describe('IconService', () => {
	describe('sendTransaction() - DepositTransaction', async () => {
		let txHash = undefined;
		let txResult = undefined;
		let depositTxHash = undefined;
		it('should return the tx hash', async () => {
			const txHashToInstall = await iconService.sendTransaction(new SignedTransaction(transactionToInstall, wallet)).execute();
			assert.ok(IconValidator.isTransactionHash(txHashToInstall));
			txHash = txHashToInstall;
			txResult = await iconService.getTransactionResult(txHashToInstall).execute();
		});

		it('deposit icx to SCORE', done => {
			setTimeout(async () => {
				const depositTransaction = new DepositTransactionBuilder()
					.from(from)
					.to(txResult.to)
					.stepLimit(stepLimit)
					.nid(nid)
					.value(IconAmount.of(5000, IconAmount.Unit.ICX).toLoop())
					.version(version)
					.timestamp(timestamp)
					.action('add')
					.build();

				depositTxHash = await iconService.sendTransaction(new SignedTransaction(depositTransaction, wallet)).execute();
				assert.ok(IconValidator.isTransactionHash(depositTxHash));
			}, 5000);
		});
	});
});
