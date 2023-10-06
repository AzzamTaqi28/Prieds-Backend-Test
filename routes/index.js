var express = require('express');
var router = express.Router();
const stock_read_log = require('../models/stock_read_log');
const FileSystem = require('fs');
const DB_ref = require('../mongodb');

router.use('/export-data', async (req, res) => {
	const list = await stock_read_log
		.aggregate([
			{
				$match: {},
			},
		])
		.exec();

	FileSystem.writeFile(
		'./stock_read_log.json',
		JSON.stringify(list),
		(error) => {
			if (error) throw error;
		}
	);

	console.log('stock_read_log.json exported!');
	res.json({ statusCode: 1, message: 'stock_read_log.json exported!' });
});

router.use('/import-data', async (req, res) => {
	const list = await stock_read_log
		.aggregate([
			{
				$match: {},
			},
		])
		.exec();

	FileSystem.readFile('./stock_read_log.json', async (error, data) => {
		if (error) throw error;

		const list = JSON.parse(data);

		const deletedAll = await stock_read_log.deleteMany({});

		const insertedAll = await stock_read_log.insertMany(list);

		console.log('stock_read_log.json imported!');
		res.json({ statusCode: 1, message: 'stock_read_log.json imported!' });
	});
});

router.use('/edit-repacking-data', async (req, res) => {
	const companyId = req.body.company_id;
	const payload = req.body.payload;
	const rejectQrList = req.body.reject_qr_list;
	const newQrList = req.body.new_qr_list;

	if (!companyId) {
		return res
			.json({ statusCode: 0, message: 'Company ID is required!' })
			.status(400);
	}

	if (!payload) {
		return res
			.json({ statusCode: 0, message: 'Payload is required!' })
			.status(400);
	}

	const stock = await stock_read_log
		.findOne({
			company_id: companyId,
			payload: payload,
			status: 1,
		})
		.exec();

	if (!stock) {
		return res.json({ statusCode: 0, message: 'Stock not found!' }).status(404);
	}

	let updatedStock = { ...stock.toObject() }; // Create a copy of the stock object to track updates
	let stockQty = updatedStock.qty;

	const session = await DB_ref.startSession();
	session.startTransaction();

	try {
		// handle reject qr list
		for (const e of rejectQrList) {
			await stock_read_log.findOneAndUpdate(
				{ payload: e.payload },
				{ status: 0, status_qc: 1 }
			);
			stockQty -= 1;
			updatedStock = await stock_read_log.findOneAndUpdate(
				{
					company_id: companyId,
					payload: payload,
					status: 1,
				},
				{ $pull: { qr_list: { payload: e.payload } }, $set: { qty: stockQty } },
				{ new: true }
			);
		}

		// handle new qr list
		for (const e of newQrList) {
			let newQr = await stock_read_log.findOne({ payload: e.payload });

			let stockRelated = await stock_read_log.findOneAndUpdate(
				{ 'qr_list.payload': e.payload },
				{
					$pull: { qr_list: { payload: e.payload } },
				},
				{ new: true }
			);
			stockRelated.qty = stockRelated.qty - 1;
			await stockRelated.save();

			stockQty += 1;
			updatedStock = await stock_read_log.findOneAndUpdate(
				{
					company_id: companyId,
					payload: payload,
					status: 1,
				},
				{ $push: { qr_list: newQr }, $set: { qty: stockQty } },
				{ new: true }
			);
		}
		await session.commitTransaction();
		session.endSession();

		return res
			.json({ statusCode: 1, message: 'success update stock', data: updatedStock })
			.status(200);
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		return res
			.json({ statusCode: 0, message: 'failed update stock', error: error })
			.status(500);
	}
});

router.use('/', function (req, res, next) {
	res.render('index', { title: 'Express' });
});

module.exports = router;
