import axios, { AxiosResponse } from 'axios';
import { XMLParser } from 'fast-xml-parser';

import { Article } from './Article';
import { PDFParser } from './pdfParser';

//Application service for searching arXiv  

interface ArXivSearchResult {
    id: string,
    updated: string,
    published: string,
    title: string,
    summary: string,
    author: []
}


//Returns an array of Articles
//A search query is sent to the arXiv public API
//Returned data is parsed into Article format {title:'',authors: [], url:'', texts:[]}
//if include text us flagged true then article text is added to each article
export async function searchArXiv(question : string, limit: number, includeText: boolean) : Promise<Article[]> {

    console.log('search arXiv');

    let articles : Article[] = [];

    try {
        //convert user question into arXiv query
        //TODO question to query conversion?
        const query = 'CNN';

        //Request data from arXiv API
        const res  = await axios.get(`http://export.arxiv.org/api/query?search_query=${query}&max_results=${limit}`);

        //parse xml data
        const parser = new XMLParser();
        const data = parser.parse(res.data);

        if(data['feed']['opensearch:totalResults'] === 0){
            console.log('no results from search');
            return [];
        }

        const entries = data.feed.entry;

        //Parse response into Article data - parse text from PDFs if needed
        const titles  = entries.map((el : ArXivSearchResult) => el.title);
        const urls = entries.map((el : ArXivSearchResult) => el.id);
        const authors = entries.map((el : ArXivSearchResult) => (el.author.map( (innerEl : {name:string}) => (innerEl.name))));
        const texts: string[][] = [];

        console.log(titles);
        console.log(urls);
        console.log(authors);

        //get text


        PDFParser.parseToChunks();

        //Build Articles list
        articles = titles.map( (el : string, i : number) => {
            const a : Article = includeText ? {title: el, url: urls[i], texts: texts[i]} : {title: el, url: urls[i], texts:[]};
            return a;
        })

    }

    catch(error){
        let message = '';
        if(typeof error === 'string'){
            message = error;
        }
        else if (error instanceof Error) {
            message = error.message 
        }
        throw new Error(`An error occurred searching arXiv: ${message}`);
    }

    return articles;
}