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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handleSearchArticles_1 = require("./src/handleSearchArticles");
const handleSummarizeArticles_1 = require("./src/handleSummarizeArticles");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3101;
app.get('/', (req, res) => {
    res.send('Welcome to Wiki Search and Summarize');
});
app.get('/search-articles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('search articles');
    yield (0, handleSearchArticles_1.handleSearchArticles)(req, res);
}));
app.get('/summarize-articles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('summarize articles');
    yield (0, handleSummarizeArticles_1.handleSummarizeArticles)(req, res);
}));
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
