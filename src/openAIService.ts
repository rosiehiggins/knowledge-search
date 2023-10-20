import axios, { AxiosResponse, AxiosError, isAxiosError } from 'axios';
import { encode  } from 'gpt-tokenizer'

import { Article } from './Article';
import { Summary } from './Summary';
import { Answer } from './Answer';

//Application service for OpenAI Content generation using their LLMs
const openAIKey = process.env.OPEN_AI_KEY;

//GPT models used in this sytem
const GPT_35_TURBO = "gpt-3.5-turbo";
const GPT_35_TURBO_16K = 'gpt-3.5-turbo-16k';

//Chat message for OpenAI chat messages
interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    token?: number;
}

//Returns an OpenAI messages array with a user message and RAG content that fits into a context window
//Content is culled to fit into either a 4k or 16k context window depending initial size of ragged content
function createRAGMessages(userMessage : string, systemMessage : string, delimiter : string = '####\n', articles : Article[]) : ChatMessage[] {
    
    const ragMessage = (arts : Article[]) => `${userMessage}Articles:\n${arts.map((el)=>(el.title + '\n' + el.texts?.join('\n') +'\n')).join(delimiter)}\n\n`;

    let messages : ChatMessage[] = [
        {role:'system',content:systemMessage},
        {role:'user',content:ragMessage(articles)}
    ]

    //Tokenize messages and count tokens in main message
    let nTokens : number  = encode(messages[1].content).length;

    //Set max tokens based on whether there are more than 3k tokens. 
    //If there are less than 3k we can used then the smaller context window model can be used.
    let maxMessageTokens : number = nTokens >= 3000 ? 15000 : 3000;

    //Create list of empty articles
    let culledArts : Article[] = articles.map(el => ({url:el.url, title: el.title, texts:[]}));
    let newNTokens = 0;
    const cols = articles.length;
    const rows = articles.reduce((a, b) => ( a >= b.texts.length ? a : b.texts.length),0);
    const maxIterations = cols * rows;
    let i = 0;
    
    //Iteratively add chunks from each article until the content no longer fits in the content window
    while (newNTokens < maxMessageTokens && i < maxIterations){

        //Get next article number for current iteration
        let artNum = articles && articles.length > 0 ? i%articles.length : 0;
        const art = articles[artNum];

        //get next chunk to add
        const chunkInx = Math.floor(i/cols);
        const nextChunk = art.texts[chunkInx];

        //continue if no next chunk
        i++;
        if(typeof nextChunk === "undefined"){
            continue;
        }

        //encode and add to total tokens
        newNTokens += encode(nextChunk).length;

        //test and set
        if(newNTokens < maxMessageTokens){
            culledArts[artNum].texts.push(nextChunk);
            messages[1].content = ragMessage(culledArts);
        }
        
    }

    console.log('########prompt:########');
    console.log(messages[1].content);

    return messages;
}

//Request chat content from OpenAI with exponential backoff and retry implemented in case of rate limiting
//Returns only generated text from request
export async function requestChatContent(messages : ChatMessage[], model : string ,maxTokens : number,temperature : number, maxRetries : number = 10) : Promise<string>  {
    
    //initial retry delay in ms
    let delay = 1;
    //generated chat content to be returned
    let chatContent = '';

    for (let i = 0; i < maxRetries; i++){
        try{
            console.log('attempt ',i);
            const response =
                await axios({
                    method: 'post',
                    url: 'https://api.openai.com/v1/chat/completions',
                    headers:{
                        'Authorization': `Bearer ${openAIKey}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        model,
                        messages,
                        temperature,
                        max_tokens:maxTokens,
                    }
                });
            chatContent = response.data.choices[0].message.content.trim();
            break;
        }

        catch(error){
            console.log('request chat content error');

            if (isAxiosError(error) && error.response) {
                //429 is too many requests error
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);

                //random adds jitter to the delay
                delay *= 2 * (1 * Math.random())
                await new Promise(resolve => setTimeout(resolve, delay));
                
            } else if (isAxiosError(error) && error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js

                //random adds jitter to the delay
                delay *= 2 * (1 * Math.random())
                await new Promise(resolve => setTimeout(resolve, delay));
                console.log(error.request);
    
            } else {
                // Something happened in setting up the request that triggered an Error so we break the attempt
                const message = isAxiosError(error) ? error.message : error;
                console.log('Error', message);
                break;
            }
        }
    }

    return chatContent;
}

//Given a list of relevant articles, returns an answer to a question
//If the given text does not fit into the context window chunks of each article are popped until the text can fit within the context window
export async function answerQuestion(question : string, articles : Article[]) : Promise<Answer> {
    
    console.log('answer question');

    const userMessage = 
        `Your task is to answer a query made by a user.\n`+
        `Text from articles related to the query is provided below. ` +
        `Each article has a title and text. Each article is delimited by ####\n`+
        `Read through all the text and then provide an answer to the given question.\n`+
        `Your answer should be written as concisely as possible.\n\n`+
        `Question: ${question}\n\n`;
    
    const systemMessage = 'You answer questions given knowledge';

    const messages = createRAGMessages(userMessage,systemMessage,'####\n',articles);

    const nTokens = encode(messages[1].content).length;

    //Set model variable based on number of tokens
    let model = nTokens >= 3000 ? GPT_35_TURBO_16K : GPT_35_TURBO;
    let answerText : string = await requestChatContent(messages,model,1000,0.3);

    const answer : Answer = {text:answerText, references:articles.map(el=>(el.url))};
    console.log(answer.text);

    return answer;
}

//Given a list of Articles this function will return a short summary of the articles using LLM (OpenAI)
//If the given text does not fit into the context window chunks of each article are popped until the text can fit within the context window
export async function summarizeArticles(articles: Article[]) : Promise<Summary> {

    console.log('summarize articles');

    const userMessage = `Your task is to summarize the following text taken from Wikipedia articles.\n`+
        `The article text is provided below. Each article has a title and text. Articles are delimited by '####'\n`+
        `Your summary should be around 4-5 sentences long.\n\n`;

    const systemMessage = 'You summarize wikipedia articles';
    const messages = createRAGMessages(userMessage,systemMessage,'####\n',articles);

    const nTokens = encode(messages[1].content).length;

    //Set model variable based on number of tokens
    const model = nTokens >= 3000 ? GPT_35_TURBO_16K : GPT_35_TURBO;
    const summaryText : string = await requestChatContent(messages,model,1000,0.3);

    const summary : Summary = {summary:summaryText, urls:articles.map(el=>(el.url))};
    console.log(summary.summary);

    return summary;

}