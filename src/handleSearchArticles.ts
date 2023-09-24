import express, { Express, Request, Response } from 'express';
import { searchWikipedia } from './wikipediaService';
import { Article } from './Article';

//Defines the reponse for the search request
interface SearchResponse  {
    success: boolean;
    message: string;
    articles?: Article[]
}

//handler function for search-articles
//Given a search query and a maximum number of articles (max = 50)
//The search is conducted using Wikipedia opensearch API
//Responds with a list of Articles {title:'',url:''} related to your search query 
export async function handleSearchArticles(req : Request, res: Response)  {
   
    console.log('handleSearchArticles');
   
    const search : string = req.query.search ? req.query.search as string : '';
    let limit : number =  parseInt(req.query.limit as string);
    
    let searchResponse : SearchResponse = {success:false,message:''}

    if(!search) {
        searchResponse.message = "Missing search query";
        res.status(400).send(searchResponse);
        return;
    }

    if(isNaN(limit)){
        searchResponse.message = "Limit is not a number";
        res.status(400).send(searchResponse);
        return;
    }

    if(limit >= 51){
        searchResponse.message = "Limit is too large";
        res.status(400).send(searchResponse);
        return;
    }

    try{
        //Search Wikipedia for articles
        const articles = await searchWikipedia(search,limit,false);

        //Set search response
        searchResponse.success = true;
        searchResponse.articles = articles;
        searchResponse.message = 'success';

        res.status(200).send(searchResponse);
        return;
    }


    catch(error){
        let message = '';

        if(typeof error === 'string'){
            message = error;
        }
        else if (error instanceof Error) {
            message = error.message 
        }
        searchResponse.message = message;
        res.status(400).send(searchResponse);
        return;
    }

    
}

