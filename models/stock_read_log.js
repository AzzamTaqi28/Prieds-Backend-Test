var mongoose = require('mongoose');

const db = require('../mongodb');

const Schema = mongoose.Schema(
  {
    company_id: String,
    site: String,

    scanned_time: {
      type: Date,
      default: Date.now
    },
		created_time: {
      type: Date,
      default: Date.now
    },
    last_updated: {
      type: Date,
      default: Date.now
    },

    sku: String,
    description: String,
    uom: String,
    
    qty: {
      type: Number,
      default: 1,
    },

    remark: String,
    sloc: String,

    attribute_list: [
      {
        k: String,
        v: String,
        _id: false,
      },
    ],

    line_id: String,
    line_type: String,

    count_string: String,
    count: Number,
    payload: {
      type: String,
    },

    wo_id: String,
    order_no: String,
    prodis_company_id: String,
    prodis_line_id: String,
    prodis_line_type: String, 

    qr_list: Array,

    status_repacking: {
      type: Number, // 0: not yet repack , 1: repacked
      default: 0,
    },
    status_move_to_bin: {
      type: Number, // 0: not yet move to bin , 1: moved to bin
      default: 0, 
    },
    status: {
      type: Number,
      default: 1, // 0: rejected, 1: ok
    },
    status_qc: {
      type: Number,
      default: 0, // 0: belum di qc, 1: reject, 2: sudah qc
    },
    status_sync: {
      type: Number,
      default: 0 // 0: not synced, 1: synced
    },
    last_synced: Date,

    status_pick: {
      type: Number,
      default: 0 // 0: not picked yet, 1: picked
    },
    
    aggregation_count: Number,

    stock_type: { // 0: unit stock, 1: QR Repacking
      type: Number,
      default: 0
    },
    
    payload_raw: String
	},
  { collection: 'stock_read_log' }
);

module.exports = db.model('stock_read_log', Schema);