import axios, { AxiosResponse } from 'axios';
import { Article } from './Article';

//Application service for searching arXiv  
//Wikipedia is searched following their search protocol : https://www.mediawiki.org/wiki/API:Search


//Returns an array of Articles
//A search query is sent to the arXiv public API
//Returned data is parsed into Article format {title:'',authors: [], url:'', texts:[]}
//if include text us flagged true then article text is added to each article
export async function searchArXiv(query : string, limit: number, includeText: boolean) : Promise<Article[]> {

    console.log('search arXiv');

    let articles : Article[] = [];

    try {
        //Request data from arXiv API
        const res  = await axios.get(`http://export.arxiv.org/api/query?search_query=${query}max_results=${limit}`);

        /*const searchResults = res.data.query.search;
        if(searchResults.length === 0){
            console.log('no results from search')
            return [];
        }


        //Parse response into Article data
        const titles : string[] = searchResults.map((el : WikiSearchResult) => el.title);
        const urls : string[] = searchResults.map((el : WikiSearchResult) => `http://en.wikipedia.org/?curid=${el.pageid}`);
        //This will be set if includeText = true
        let texts : string[][] = [];

        //Get article text
        //For each URL get html body and parse p elements using Cheerio
        if(includeText){
            
            let promiseList = [];

            for(const url of urls ){
                promiseList.push(
                    //grab article HTML data
                    axios.get(url)
                    .then((res : AxiosResponse)=>{
                        //Parse DOM
                        const $ = cheerio.load(res.data);
                        //Query all p elements to grab article text
                        const $p = $('p').text();
                        const trimmed = $p.split(/\n/g).filter(el => el)
                        return trimmed;
                    })
                )
            }

            //Set texts data
            texts = await Promise.all(promiseList);
        }

        //Build Articles list
        articles = titles.map( (el,i) => {
            const a : Article = includeText ? {title: el, url: urls[i], texts: texts[i]} : {title: el, url: urls[i], texts:[]};
            return a;
        })*/
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