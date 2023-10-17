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

//Request chat content from OpenAI with exponential backoff and retry implemented in case of rate limiting
//Returns only generated text from request
export async function requestChatContent(messages : ChatMessage[], model : string ,maxTokens : number,temperature : number, maxRetries : number = 10) : Promise<string>  {

    let delay = 1;

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
            return response.data.choices[0].message.content.trim();
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
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } else if (isAxiosError(error) && error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                //random adds jitter to the delay
                delay *= 2 * (1 * Math.random())
                await new Promise(resolve => setTimeout(resolve, delay));
                console.log(error.request);
    
            } else {
                // Something happened in setting up the request that triggered an Error
                const message = isAxiosError(error) ? error.message : error;
                console.log('Error', message);
                return '';
            }
        }
    }

    return '';
}

export async function answerQuestion(dataSource : Article[]) : Promise<Answer> {
    let answer : Answer = {text:'', references: []};

    return answer;
}

//Given a list of Articles this function will return a short summary of the articles using LLM (OpenAI)
//If the given text does not fit into the context window chunks of each article are popped until the text can fit within the context window
export async function summarizeArticles(articles: Article[]) : Promise<Summary> {

    console.log('summarize articles');

    //Function to create chat messages (prompt) for summary generation.
    //A function allows it to be iteratively generated to allow the messages 
    let getMessages = (arts : Article[]) : ChatMessage[] => {

        let mainMessage = 
            `Your task is to summarize the following text taken from Wikipedia articles.\n`+
            `The article text is provided below. Each article has a title and text. Articles are delimited by '####'\n`+
            `Your summary should be around 4-5 sentences long.\n`+
            `Articles:"\n`+
            `${arts.map((el)=>(el.title + '\n' + el.text +'\n')).join('####')}"`;
        
        const messages : ChatMessage[] = [
            {role:'system',content:'You summarize wikipedia articles'},
            {role:'user',content:mainMessage}
        ]

        return messages;
    }

    //Get messages for OpenAI
    let messages : ChatMessage[] = getMessages(articles);
    
    //Tokenize messages and count tokens in main message
    let nTokens : number  = encode(messages[1].content).length;

    //Set max tokens based on whether there are more than 3k tokens. 
    //If there are less than 3k we can used then the smaller context window model can be used.
    let maxMessageTokens : number = nTokens >= 3000 ? 15000 : 3000;

    //Cull text to fit in context window if needed. This needs to happen if articles are too long.
    //The system loops through each article and culls a chunk of text until it fits.
    let i = 0;
    while (nTokens > maxMessageTokens){
        console.log('culling text to fit inside context window');
        
        //Get next article number for current iteration
        let artNum = articles && articles.length > 0 ? i%articles.length : 0;

        //Convert text to array of paragraphs by splitting
        let articleTextArr : string[] | undefined = articles[artNum]?.text ? articles[artNum].text?.split('\n') : [];
        if(typeof articleTextArr === 'undefined')
            continue
        
        //Pop off last text chunk from article
        articleTextArr.pop();

        //Reassign article text
        articles[artNum].text = articleTextArr.join('\n');

        //Regenerate messages
        messages = getMessages(articles);

        //Re-tokenize to check context window
        nTokens = encode(messages[1].content).length;
        i++;
    }

    //Set model variable based on max token limit
    let model = maxMessageTokens === 15000 ? GPT_35_TURBO_16K : GPT_35_TURBO;
    let summaryText : string = await requestChatContent(messages,model,1000,0.3);

    let summary : Summary = {summary:summaryText, urls:articles.map(el=>(el.url))};

    return summary;

}