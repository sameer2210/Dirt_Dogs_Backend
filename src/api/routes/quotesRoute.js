import express from "express";
import { createQuote, deleteQuote, getQuoteByFilter, getQuoteById, updateQuote } from "../controllers/quotesController.js";

const router = express.Router();


router.post("/admin/createQuote", createQuote);
router.put("/admin/updateQuote",updateQuote);
router.get("/admin/getQuoteById", getQuoteById);
router.delete("/admin/deleteQuote", deleteQuote);
router.get("/admin/getQuoteByFilter", getQuoteByFilter);

// User routes
router.get("/users/getQuoteByFilter", getQuoteByFilter);
router.get("/users/getQuoteById", getQuoteById);

export default router;