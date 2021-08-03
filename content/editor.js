var cropper;
var currentMimeType;



document.addEventListener("DOMContentLoaded", function() {
  createEventListeners();
});

function createEventListeners() {
  // Save button in the menu is clicked.
  document.getElementById("menu-save-button").addEventListener("click", function() {
    // If no specific option is chosen, image is saved as a .png.
    openModal("image/png");

  });

  // Copy button in the menu is clicked.
  document.getElementById("menu-copy-button").addEventListener("click", async function() {
    // Copy .png to clipboard.
    copyImageToClipboard()

  });

  // Save as .png dropdown option is clicked.
  document.getElementById("menu-dropdown-item-png").addEventListener("click", function() {
    openModal("image/png");
  });

  // Save as .jpeg dropdown option is clicked.
  document.getElementById("menu-dropdown-item-jpeg").addEventListener("click", function() {
    openModal("image/jpeg");
  });
  
  // Save as .webp dropdown option is clicked.
  document.getElementById("menu-dropdown-item-webp").addEventListener("click", function() {
    openModal("image/webp");
  });

  // Dark theme toggle is clicked.
  document.getElementById("menu-dark-theme-toggle").addEventListener("change", function() {
    // Set either light or dark theme.
    toggle = document.getElementById("menu-dark-theme-toggle");
    theme = (toggle.checked ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  });

  // Filename input field is typed in.
  document.getElementById("modal-filename-input").addEventListener("input", function() {
    input = document.getElementById("modal-filename-input");
    showError = input.value == "";
    
    // Decide whether or not to display the filename required error.
    document.getElementById("modal-filename-input-error").style.visibility = (showError ? "visible" : "hidden");
    
    // Disable the save button if an error is shown.
    document.getElementById("modal-save-button").style.opacity = (showError ? "0.5": "1");
    document.getElementById("modal-save-button").style.pointerEvents = (showError ? "none" : "all");
  });

  // Save button in the modal is clicked.
  document.getElementById("modal-save-button").addEventListener("click", function() {
    // Sanitize filename.
    filename = document.getElementById("modal-filename-input").value.replace(/([^a-z0-9-_ ]+)/gi, '-');
    // Add appropriate file extension.
    filename += "." + currentMimeType.split("/")[1];
    downloadImage(filename, currentMimeType);
    closeModal();
  });

  // Cancel button in the modal is clicked.
  document.getElementById("modal-cancel-button").addEventListener("click", function() {
    closeModal();
  });
}

function setScreenshot(screenshot) {
  image = document.getElementById("screenshot");
  image.src = screenshot;

  // At this point the page is ready to be displayed.
  document.getElementById("loading").remove();
  document.getElementById("container").style.visibility = "visible";

  // Create the new cropper object to allow for cropping of the screenshot.
  cropper = new Cropper(image, {
    autoCropArea: 1,
    responsive: false,
    guides: false,
    background: false,
    zoomable: false,
    scalable: false,
    rotatable: false,
    movable: false
  });
}

function openModal(mimeType) {
  currentMimeType = mimeType;

  document.getElementById("overlay").style.visibility = "visible";
  document.getElementById("modal").style.visibility = "visible";

  // Create placeholder text and select it for the user.
  input = document.getElementById("modal-filename-input");
  input.value = "cropped-screenshot";
  input.focus();
  input.select();

  // Show the correct file extension depending on the user's selection.
  document.getElementById("modal-filename-filetype").innerHTML = "." + mimeType.split("/")[1];
  
}

function closeModal() {
  document.getElementById("overlay").style.visibility = "hidden";
  document.getElementById("modal").style.visibility = "hidden";
  document.getElementById("modal-filename-input-error").style.visibility = "hidden";
  document.getElementById("modal-save-button").style.opacity = "1";
  document.getElementById("modal-save-button").style.pointerEvents = "all";
}

function downloadImage(filename, mimeType) {
  // Get the Data URL of the cropped image and download it. File type will depend on what the user picked earlier.
  dataURL = cropper.getCroppedCanvas().toDataURL(mimeType);
  chrome.downloads.download({
    "url": dataURL,
    "filename": filename,
    "conflictAction": "uniquify"
  });
}

function copyImageToClipboard(dataURI) {
  // Create a blob from the cropped image and add it to the clipboard as a .png.
  blob = dataURItoBlob(cropper.getCroppedCanvas().toDataURL())
  const item = new ClipboardItem({"image/png": blob});
  navigator.clipboard.write([item]);
  Snackbar.show({
    text: "Successfully copied to clipboard!",
    pos: "bottom-center",
    showAction: false,
    textColor: getComputedStyle(document.documentElement).getPropertyValue("--text-color"),
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--modal-background-color"),
    duration: 2000
  });
}

function dataURItoBlob(dataURI) {
  // Convert base64/URLEncoded data component to raw binary data held in a string.
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
  else
      byteString = unescape(dataURI.split(',')[1]);

  // Separate out the mime component.
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // Write the bytes of the string to a typed array.
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type:mimeString});
}


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