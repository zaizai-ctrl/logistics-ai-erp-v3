import express from 'express';
import { upload } from '../utils/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildCsv, parseCsv } from '../utils/csv.js';
import { matchProductByAI } from '../services/aiService.js';
import {
  createProductRule,
  deleteProductRule,
  listProductLibrary,
  updateProductRule
} from '../services/productLibraryService.js';
import {
  createScanOrder,
  exportOrders,
  importOrders,
  listOrders,
  listPayables,
  updateOrderStatus
} from '../services/orderService.js';
import { getFinanceData, getInventoryData } from '../services/queryService.js';

const router = express.Router();

router.post(
  '/ai/match',
  asyncHandler(async (req, res) => {
    if (!req.body.text) {
      throw new Error('商品描述不能为空');
    }

    const result = await matchProductByAI(req.body.text || '');
    res.json({
      success: true,
      data: result
    });
  })
);

router.post(
  '/scan',
  asyncHandler(async (req, res) => {
    const data = await createScanOrder(req.body);
    res.json({
      success: true,
      data
    });
  })
);

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const result = await listOrders(req.query);
    res.json({
      success: true,
      data: result.rows,
      summary: result.summary
    });
  })
);

router.post(
  '/update-status',
  asyncHandler(async (req, res) => {
    const data = await updateOrderStatus(req.body);
    res.json({
      success: true,
      data
    });
  })
);

router.get(
  '/inventory',
  asyncHandler(async (_req, res) => {
    const data = await getInventoryData();
    res.json({
      success: true,
      data
    });
  })
);

router.get(
  '/finance',
  asyncHandler(async (_req, res) => {
    const data = await getFinanceData();
    res.json({
      success: true,
      data
    });
  })
);

router.get(
  '/payables',
  asyncHandler(async (_req, res) => {
    const data = await listPayables();
    res.json({
      success: true,
      data
    });
  })
);

router.post(
  '/import-csv',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new Error('请上传 CSV 文件');
    }

    const rows = parseCsv(req.file.buffer);
    const data = await importOrders(rows);
    res.json({
      success: true,
      data
    });
  })
);

router.get(
  '/export-csv',
  asyncHandler(async (req, res) => {
    const rows = await exportOrders(req.query);
    const csv = buildCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(`\uFEFF${csv}`);
  })
);

router.get(
  '/product-library',
  asyncHandler(async (_req, res) => {
    const data = await listProductLibrary();
    res.json({
      success: true,
      data
    });
  })
);

router.post(
  '/product-library',
  asyncHandler(async (req, res) => {
    if (!req.body.keyword || !req.body.product_name) {
      throw new Error('关键词和标准商品名不能为空');
    }
    const data = await createProductRule(req.body);
    res.json({
      success: true,
      data
    });
  })
);

router.put(
  '/product-library/:id',
  asyncHandler(async (req, res) => {
    if (!req.body.keyword || !req.body.product_name) {
      throw new Error('关键词和标准商品名不能为空');
    }
    const data = await updateProductRule(req.params.id, req.body);
    res.json({
      success: true,
      data
    });
  })
);

router.delete(
  '/product-library/:id',
  asyncHandler(async (req, res) => {
    const data = await deleteProductRule(req.params.id);
    res.json({
      success: true,
      data
    });
  })
);

export default router;
