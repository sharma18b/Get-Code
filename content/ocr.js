


ocr(image);



async function ocr(myImage) {
    return new Promise(async function(resolve, reject) {
      const worker = createWorker({
        logger: m => console.log("[OCR] '" + myImage + "' : ",m["progress"]*100 + "%")
      });
      await worker.load();
       await worker.loadLanguage('eng');
       await worker.initialize('eng');
       var { data: { text } } = await worker.recognize(myImage);
       await worker.terminate();
       resolve(text);
    });
  }