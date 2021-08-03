const t = require('tesseract.js')
t.recognize(path,'eng').then(out => console.log(out.data.text))


// var image = document.createElement("img");
// image.src = "./images/test.jpeg";

// var promise = navigator.clipboard.read();
// console.log(promise);

//'./images/test.jpeg'