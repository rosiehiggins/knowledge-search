import express, { Express, Request, Response, RequestHandler } from 'express';
import { searchWikipedia } from './wikipediaService';
import { Article } from './Article';
import { Answer } from './Answer';
import { Question } from './Question';

//Defines the reponse for the answer request
interface AnswerResponse  {
    success: boolean;
    message: string;
    answer: Answer;
}

export async function handleAnswer(req : Request, res: Response)  {
   
    console.log('answers');

    const question : Question = {text:req.body.question,source:req.body.source};
       
    let answer : Answer = {text:'',source:''};
    let answerResponse : AnswerResponse = {success:false, message:'', answer:answer};

    //If no question text is provided then return bad request
    if(!question.text) {
        answerResponse.message = "Missing question text";
        res.status(400).send(answerResponse);
        return;
    }

    //If no source then set default source to wiki
    if(!question.source) {
        question.source = "wiki";
    }

    try {
        //Get key words from question

        //Search Wikipedia for article(s)
        //const articles = await searchWikipedia(search,limit,false);

        //Generate question answer

        //TODO set return status based on whether there is data
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

        //TODO check status code here
        res.status(400).send(answerResponse);
        return;
    }

    
}

