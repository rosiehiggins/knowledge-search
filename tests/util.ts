import axios, { AxiosResponse } from 'axios';

//Makes a POST request to the API with a given route and data object
export const makePOSTRequest = async (route: string, data : Object) => {
    
    const response = await axios({
        method: 'post',
        url: `http://localhost:${process.env.PORT}/${route}`,
        headers:{
            'Content-Type': 'application/json'
        },
        data
    });
    
    return response;
}
