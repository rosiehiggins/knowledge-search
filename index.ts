//3rd party modules
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

//Handlers
import { handleSearchArticles } from './src/handleSearchArticles';
import { handleSummarizeArticles } from './src/handleSummarizeArticles';

dotenv.config();

//App initialization
const app: Express = express();
const port = process.env.PORT || 3101;

//Routes
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

//App listen
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});