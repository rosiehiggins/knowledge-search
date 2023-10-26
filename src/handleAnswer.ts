import express, { Express, Request, Response, RequestHandler } from 'express';
import { searchWikipedia } from './wikipediaService';
import { searchArXiv } from './arXivService';
import { answerQuestion } from './openAIService';
import { Article } from './Article';
import { Answer } from './Answer';
import { Question } from './Question';

//Defines the reponse for the answer request
interface AnswerResponse  {
    success: boolean;
    message: string;
    answer: Answer;
}

const sources = ['wiki','arxiv']

export async function handleAnswer(req : Request, res: Response)  {
   
    console.log('answers');

    const question : Question = {text:req.body.question,source:req.body.source};
       
    let answer : Answer = {text:'', references:[]};
    let answerResponse : AnswerResponse = {success:false, message:'', answer:answer};

    //If no question text is provided then return bad request
    if(!question.text) {
        console.log('missing question');
        answerResponse.message = "Missing question text";
        res.status(400).send(answerResponse);
        return;
    }

    //If no source then set default source to wiki
    if(!question.source) {
        console.log('missing source');
        question.source = "wiki";
    }

    //If source is not recognised return bad request
    else if(!sources.includes(question.source)){
        console.log('invalid source');
        answerResponse.message = "Requested source does not exist, select an available source";
        res.status(400).send(answerResponse);
        return;
    }

    console.log('source',question.source);

    try {

        let articles = [];

        //Get keywords from question

        if(question.source === 'arxiv'){
            articles = await searchArXiv(question.text,5,true);
        }

        else {
            //Search Wikipedia for article(s)
            articles = await searchWikipedia(question.text,5,true);
        }

        
        //response if no results
        if(articles.length===0){
            answerResponse.success = true;
            answerResponse.message = "No results found";
            res.status(204).send();
            return;
        }

        //Generate question answer
        //const answer = await answerQuestion(question.text,articles);

        answerResponse.success = true;
        answerResponse.message = 'Answer retrieved successfully'
        //answerResponse.answer = answer;

        res.status(200).send(answerResponse);
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
        answerResponse.message = message;

        console.log(message);

        res.status(500).send(answerResponse);
        return;
    }

    
}

