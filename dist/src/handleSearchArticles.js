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
exports.handleSearchArticles = void 0;
const wikipediaService_1 = require("./wikipediaService");
//handler function for search-articles
//Given a search query and a maximum number of articles (max = 50)
//The search is conducted using Wikipedia opensearch API
//Responds with a list of Articles {title:'',url:''} related to your search query 
function handleSearchArticles(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('handleSearchArticles');
        const search = req.query.search ? req.query.search : '';
        let limit = parseInt(req.query.limit);
        let searchResponse = { success: false, message: '' };
        if (!search) {
            searchResponse.message = "Missing search query";
            res.status(400).send(searchResponse);
            return;
        }
        if (isNaN(limit)) {
            searchResponse.message = "Limit is not a number";
            res.status(400).send(searchResponse);
            return;
        }
        if (limit >= 51) {
            searchResponse.message = "Limit is too large";
            res.status(400).send(searchResponse);
            return;
        }
        try {
            //Search Wikipedia for articles
            const articles = yield (0, wikipediaService_1.searchWikipedia)(search, limit, false);
            //Set search response
            searchResponse.success = true;
            searchResponse.articles = articles;
            searchResponse.message = 'success';
            res.status(200).send(searchResponse);
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
            searchResponse.message = message;
            res.status(400).send(searchResponse);
            return;
        }
    });
}
exports.handleSearchArticles = handleSearchArticles;
