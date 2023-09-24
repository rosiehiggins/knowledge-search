import express, { Express, Request, Response } from 'express';
import { handleSearchArticles } from './src/handleSearchArticles';
import { handleSummarizeArticles } from './src/handleSummarizeArticles';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3101;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Wiki Search and Summarize');
});

app.get('/search-articles', async (req: Request, res: Response) => {
  console.log('search articles');
  await handleSearchArticles(req,res);
})

app.get('/summarize-articles', async (req: Request, res: Response) => {
  console.log('summarize articles');
  await handleSummarizeArticles(req,res);
})


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});