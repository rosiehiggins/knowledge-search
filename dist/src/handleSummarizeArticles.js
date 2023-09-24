"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSummarizeArticles = void 0;
const wikipediaService_1 = require("./wikipediaService");
const openAIService_1 = require("./openAIService");
//handler function for summarize-articles
//Given a search query e.g. "New York" or "Sherlock Holmes" and a number of articles (max 3)
//This responds with a LLM generated summary of all the returned wikipedia articles using the OpenAI API
//It implements a 2 stage RAG (retrieval augmented generation) system.
//First wikipedia is queried and the most related articles are returned.
//The Wikipedia html is grabs for each article and the text parsed out.
//Then the article text is injected into a prompt and if necessary text is culled so that it can fit into the model context window.
// The LLM model used is dynamically  set based on the size of the article text.
function handleSummarizeArticles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('handleSummarizeArticles');
        const search = req.query.search;
        const limit = parseInt(req.query.limit);
        let summaryResponse = { success: false, message: '' };
        if (!search) {
            summaryResponse.message = "Missing search query";
            res.status(400).send(summaryResponse);
            return;
        }
        if (isNaN(limit)) {
            summaryResponse.message = "Limit is not a number";
            res.status(400).send(summaryResponse);
            return;
        }
        if (limit >= 4) {
            summaryResponse.message = "Limit is too large";
            res.status(400).send(summaryResponse);
            return;
        }
        try {
            const articles = yield (0, wikipediaService_1.searchWikipedia)(search, limit, true);
            const summary = yield (0, openAIService_1.summarizeArticles)(articles);
            summaryResponse.success = true;
            summaryResponse.summary = summary;
            summaryResponse.message = 'success';
            res.status(200).send(summaryResponse);
            return;
        }
        catch (error) {
            let message = '';
            if (typeof error === 'string') {
                message = error;
            }
            else if (error instanceof Error) {
                message = error.message;
            }
            summaryResponse.message = message;
            res.status(400).send(summaryResponse);
            return;
        }
    });
}
exports.handleSummarizeArticles = handleSummarizeArticles;
