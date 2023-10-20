
import { makePOSTRequest } from './util';


export const testAnswers = async () => {

    //'Explain RGBM'
    try{
        const responses = await Promise.all([
            
            makePOSTRequest('answer', {question:'What is the capital of England',source:'wiki'})
            .then((res)=> (res.data.success)),
    
            makePOSTRequest('answer', {question:'wejrkwnsvkjf',source:'wiki'})
            .then((res)=> {console.log(res.data); return res.status === 204}),
        ]) 
    
        console.log(responses)
        const pass = responses.every(el => el);
        return pass;
    }

    catch(error){
        let message = '';
        if(typeof error === 'string'){
            message = error;
        }
        else if (error instanceof Error) {
            message = error.message 
        }
        console.log(message);
        return false;
    }

    

}

