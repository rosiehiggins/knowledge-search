import {getDocument} from 'pdfjs-dist'
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

export class PDFParser{

    static async parseToChunks(fileBuffer : Uint8Array) : Promise<string[]> {
        console.log('parse pdf to text chunks');
        
        let loadingTask = getDocument(fileBuffer); 
        let pdf = await loadingTask.promise;

        const pageCount = pdf.numPages;
        //console.log(pdf.numPages);

        let promiseList = [];

        for(let p = 0; p < pageCount; p++){

            promiseList.push(
                pdf.getPage(p+1)
                .then((page)=>{
                    return page.getTextContent();
                })
                .then((textContent) => {
                    let pageItems = [];

                    for(let item of textContent.items){
                        //force as textItem so we can access textItem props
                        let i = item as TextItem;
                        let itemStr = i.str + ' ';
                        pageItems.push(itemStr);
                    }
        
                    return pageItems.join(' ');
                })
                .catch((e)=>{
                    console.error(e);
                    return '';
                })
            )

        }

        const chunks = await Promise.all(promiseList);

        return chunks;
    }

}