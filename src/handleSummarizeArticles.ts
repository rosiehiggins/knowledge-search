import express, { Express, Request, Response } from 'express';

import { searchWikipedia } from './wikipediaService';
import { summarizeArticles } from './openAIService';

import { Article } from './Article';
import { Summary } from './Summary';

interface SummaryResponse  {
    success: boolean;
    message: string;
    summary?: Summary
}

//handler function for summarize-articles
//Given a search query e.g. "New York" or "Sherlock Holmes" and a number of articles (max 3)
//This responds with a LLM generated summary of all the returned wikipedia articles using the OpenAI API
//It implements a 2 stage RAG (retrieval augmented generation) system.
//First wikipedia is queried and the most related articles are returned.
//The Wikipedia html is grabs for each article and the text parsed out.
//Then the article text is injected into a prompt and if necessary text is culled so that it can fit into the model context window.
// The LLM model used is dynamically  set based on the size of the article text.
export async function handleSummarizeArticles(req : Request, res: Response)  {
   
    console.log('handleSummarizeArticles');
   
    const search : string = req.query.search as string;
    const limit : number =  parseInt(req.query.limit as string);

    let summaryResponse : SummaryResponse = {success:false,message:''}

    if(!search) {
        summaryResponse.message = "Missing search query";
        res.status(400).send(summaryResponse);
        return;
    }

    if(isNaN(limit)){
        summaryResponse.message = "Limit is not a number";
        res.status(400).send(summaryResponse);
        return;
    }

    if(limit >= 4){
        summaryResponse.message = "Limit is too large";
        res.status(400).send(summaryResponse);
        return;
    }

    try {
        const articles : Article[] = await searchWikipedia(search,limit,true);
        const summary : Summary = await summarizeArticles(articles);

        summaryResponse.success = true;
        summaryResponse.summary = summary;
        summaryResponse.message = 'success';
    
        res.status(200).send(summaryResponse);
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
        summaryResponse.message = message;
        res.status(400).send(summaryResponse);
        return;
    }


}