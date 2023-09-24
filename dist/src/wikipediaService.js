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
exports.searchWikipedia = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
//Application service for searching wikipedia 
//Wikipedia is searched following their open search protocol : https://en.wikipedia.org/w/api.php?action=help&modules=opensearch
//Returns an array of Articles, 
//A search query is sent to Wikipedia
//Returned data is parsed into Article format {title:'',url:''}
//if include text us flagged true then article text is added to each article
//To retrieve article text the HTML for each article url is grabbed and parsed into a string.
function searchWikipedia(search, limit, includeText) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('search wikipedia');
        let articles = [];
        try {
            //Request data from wikipedia API
            const res = yield axios_1.default.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${search}&limit=${limit}&format=json`);
            //Parse response into Article data
            const titles = res.data[1];
            const urls = res.data[3];
            //This will be set if includeText = true
            let texts = [];
            //Get article text
            //For each URL get html body and parse p elements using Cheerio
            if (includeText) {
                let promiseList = [];
                for (const url of urls) {
                    promiseList.push(
                    //grab article HTMLL data
                    axios_1.default.get(url)
                        .then((res) => {
                        //Parse DOM
                        const $ = cheerio_1.default.load(res.data);
                        //Query all p elements to grab article text
                        const $p = $('p').text();
                        return $p;
                    }));
                }
                //Set texts data
                texts = yield Promise.all(promiseList);
            }
            //Build Articles list
            articles = titles.map((el, i) => {
                const a = includeText ? { title: el, url: urls[i], text: texts[i] } : { title: el, url: urls[i] };
                return a;
            });
        }
        catch (error) {
            let message = '';
            if (typeof error === 'string') {
                message = error;
            }
            else if (error instanceof Error) {
                message = error.message;
            }
            throw new Error(`An error occurred searching Wikipedia: ${message}`);
        }
        return articles;
    });
}
exports.searchWikipedia = searchWikipedia;
