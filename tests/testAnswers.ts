import axios, { AxiosResponse } from 'axios';
import { test } from 'node:test';

export const testAnswers = async () => {

    let result = false;

    
    const response = await axios({
        method: 'post',
        url: `http://localhost:${process.env.PORT}/answers`,
        headers:{
            'Content-Type': 'application/json'
        },
        data: {
            question:'What is the capital of England?',
            source:'wiki'
        }
    });

    console.log(response.data);

    if(response?.data?.success){
        result = true;
    }


    return result;

}

