import dotenv from 'dotenv';
dotenv.config();

import { testAnswers } from "./testAnswers"; 

const runTests = async ( test? : string) => {
    console.log('running tests');

    // print process.argv
    process.argv.forEach(function (val, index, array) {
        console.log(index + ': ' + val);
    });

    const result = await testAnswers();
    const log = result ? 'tests passed' : 'tests failed'
    
    console.log(log);
}

runTests();