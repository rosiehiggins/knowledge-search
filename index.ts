//dotenv
import dotenv from 'dotenv';
dotenv.config();

//3rd party modules
import express, { Express, Request, Response } from 'express';
//import {json,urlencoded} from 'body-parser';

//Handlers
import { handleSearchArticles } from './src/handleSearchArticles';
import { handleSummarizeArticles } from './src/handleSummarizeArticles';
import { handleAnswer } from './src/handleAnswer';


//App initialization
const app: Express = express();
const port = process.env.PORT || 3101;

//Middleware
app.use(express.json());

//Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to knowledge search');
});

app.post('/answers', handleAnswer);

app.get('/search-articles', async (req: Request, res: Response) => {
  console.log('search articles');
  await handleSearchArticles(req,res);
})

app.get('/summarize-articles', async (req: Request, res: Response) => {
  console.log('summarize articles');
  await handleSummarizeArticles(req,res);
})

//App listen
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});