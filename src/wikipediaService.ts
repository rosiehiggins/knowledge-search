import axios, { AxiosResponse } from 'axios';
import { Article } from './Article';
import cheerio from 'cheerio';

//Application service for searching wikipedia 
//Wikipedia is searched following their open search protocol : https://en.wikipedia.org/w/api.php?action=help&modules=opensearch


//Returns an array of Articles, 
//A search query is sent to Wikipedia
//Returned data is parsed into Article format {title:'',url:''}
//if include text us flagged true then article text is added to each article
//To retrieve article text the HTML for each article url is grabbed and parsed into a string.
export async function searchWikipedia(search : string, limit: number, includeText: boolean) : Promise<Article[]> {

    console.log('search wikipedia');

    let articles : Article[] = [];

    try {
        //Request data from wikipedia API
        const res = await axios.get(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${search}&limit=${limit}&format=json`);

        //Parse response into Article data
        const titles : string[] = res.data[1];
        const urls : string[] = res.data[3];
        //This will be set if includeText = true
        let texts : string[] = [];

        //Get article text
        //For each URL get html body and parse p elements using Cheerio
        if(includeText){
            
            let promiseList = [];

            for(const url of urls ){
                promiseList.push(
                    //grab article HTMLL data
                    axios.get(url)
                    .then((res : AxiosResponse)=>{
                        //Parse DOM
                        const $ = cheerio.load(res.data);
                        //Query all p elements to grab article text
                        const $p = $('p').text();
                        return $p;
                    })
                )
            }

            //Set texts data
            texts = await Promise.all(promiseList);
        }

        //Build Articles list
        articles = titles.map( (el,i) => {
            const a : Article = includeText ? {title: el, url: urls[i], text: texts[i]} : {title: el, url: urls[i]};
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
        throw new Error(`An error occurred searching Wikipedia: ${message}`);
    }

    return articles;
}