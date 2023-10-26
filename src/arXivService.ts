import axios, { AxiosError, AxiosResponse } from 'axios';
import { XMLParser } from 'fast-xml-parser';

import { extractKeywordsAndPhrases } from './openAIService';
import { Article } from './Article';
import { PDFParser } from './pdfParser';

//Application service for searching arXiv  

interface ArXivSearchResult {
    id: string,
    updated: string,
    published: string,
    title: string,
    summary: string,
    author: {name:string} | []
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
        const keywords = await extractKeywordsAndPhrases(question);
        console.log('keywords',keywords);
        const query = 'LLMs';

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
        const authors = entries.map((el : ArXivSearchResult) => ( Array.isArray(el.author) ? el.author.map( (innerEl : {name:string}) => (innerEl.name)) : el.author.name));
        let texts: string[][] = [];

        console.log(titles);

        //get text
        if(includeText){
            let promiseList = [];
            for (const u of urls){
                const url = new URL(u);
                const path = url.pathname.split('/');
                const pdfURL = path.length === 3 ? `http://arxiv.org/pdf/${path[path.length - 1]}.pdf` : 
                    `http://arxiv.org/pdf/${path[path.length - 2]}/${path[path.length - 1]}.pdf`;
                console.log(pdfURL);
                promiseList.push(
                    //get article pdf file
                    axios.get(pdfURL,{responseType: 'arraybuffer', headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/pdf'
                    }})
                    .then((res : AxiosResponse)=>{
                        console.log(res.status);
                        const view = new Uint8Array(res.data);
                        return PDFParser.parseToChunks(view);
                    })
                    .catch((e)=>{
                        console.log('error getting pdf')
                        if (axios.isAxiosError(e)) {
                            console.log(e.message)
                        } 
                          
                        else {
                            console.error(e);
                        }

                        return [];
                    })
                )
                
            }

            texts = await Promise.all(promiseList)
            
        }

       

        //Build Articles list
        articles = titles.map( (el : string, i : number) => {
            const a : Article = includeText ? {title: el, url: urls[i], texts: texts[i], authors} : {title: el, url: urls[i], texts:[], authors};
            return a;
        })

    }

    catch(error){
        if (axios.isAxiosError(error)) {
            console.log(error.status)
            console.error(error.response);
            throw new Error(`An error occurred searching arXiv: ${error.message}`)
          } else {
            console.error(error);
            throw new Error(`An error occurred searching arXiv`);
          }
    }

    return articles;
}