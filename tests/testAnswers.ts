
import { makePOSTRequest } from './util';

export const testAnswers = async () => {

    let result = false;

    const response = await makePOSTRequest('answers', {question:'What is the capital of England?',source:'wiki'})

    console.log(response.data);

    if(response?.data?.success){
        result = true;
    }

    return result;

}

