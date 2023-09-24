# Wikipedia search and summarize REST API application

This is an example microservice providing a REST API with two endpoints: search articles and summarize articles.
search-articles allows you to search for a number of wikipedia articles using the Wikipedia public API given a 
search query and a limit. summarize-articles provides a summary of the top articles returned from a search query 
(you can summarize up to three articles). It implements a 2 stage RAG (retrieval augmented generation) system, 
which first queries Wikipedia, grabs the Wikipedia html for each article and parses out the text. Then the 
article text is injected into a prompt and if necessary text is culled so that it can fit into the model context window. 
The LLM model used is dynamically  set based on the size of the article text.

## Set up

create a .env file and include an API key for OpenAI under OPEN_AI_KEY 

## Install

    npm install

## Build

    npm run build

## Run the app

    npm start

## Run the tests

    //I ran out of time for creating tests but they would go here
    //I would create a function to call all of the end-points and assert the results. 
    //OpenAI content can be checked by setting the model temperature to 0.

# REST API

The REST API to the application is described below.

## Search Wikipedia articles

Given a search query e.g. "New York" or "Sherlock Holmes" and a number of articles, this returns a list of
articles matching your search query.

### Request

### Query parameters 

    search: a string describing your search query. This parameter is required
    limit: the maximum number of articles to return, the limit is 50. This parameter is required

`GET /search-articles?search=beagles&limit=3`

    curl -i -H 'Accept: application/json' "http://localhost:3101/search-articles?search=beagles&limit=3"

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 113
    ETag: W/"71-TYg8v/SzGeK3qKcL2oE4B0dsaTg"
    Date: Sat, 23 Sep 2023 18:31:00 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"success":true,"message":"success","articles":[{"title":"Beagle","url":"https://en.wikipedia.org/wiki/Beagle"}]}


## Get a summary of wikipedia articles

Given a search query e.g. "New York" or "Sherlock Holmes" and a number of articles (limit), this returns a summary of 
all the articles inlcuded in the query. Up to a limit of 3 articles. It implements a 2 stage RAG 
(retrieval augmented generation) system, which first queries Wikipedia, grabs the Wikipedia html for each article 
and parses out the text. Then the article text is injected into a prompt and if necessary text is culled so that 
it can fit into the model context window. The LLM model used is dynamically  set based on the size of the article text.

### Request

### Query parameters 

    search: a string describing your search query. This parameter is required
    limit: the maximum number of articles to inlcude in your summary, the limit is 3. This parameter is required

`GET /summarize-articles?search=beagles&limit=2`

     curl -i -H 'Accept: application/json' "http://localhost:3101/summarize-articles?search=beagles&limit=2"

### Response

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 727
    ETag: W/"2d7-pBbnGfI/HaLaKDz5v6CEburwAKs"
    Date: Sat, 23 Sep 2023 18:36:25 GMT
    Connection: keep-alive
    Keep-Alive: timeout=5

    {"success":true,"message":"success","summary":{"summary":"Beagles & Ramsay is an art duo based in Glasgow, Scotland. They have been working collaboratively since 1997 and have exhibited their sculptures, installations, videos, performances, and drawings nationally and internationally. Their work often involves fictionalized self-portraiture and a humorous examination of contemporary consumer culture. They use doppelgangers as a means of exploring different voices and personas within their work. Beagles & Ramsay have curated group exhibitions and other projects, and their work has been reviewed in various publications.","urls":["https://en.wikipedia.org/wiki/Beagle","https://en.wikipedia.org/wiki/Beagles_%26_Ramsay"]}}





