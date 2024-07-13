// // Constants
// const FILE_UPLOAD_FIELD_NAME = "upload_file";

// // Inporting required packages in constants
// const express = require("express");
// const request = require("request");
// const body_parser = require("body-parser");
// const path = require('path');
// const fs = require("fs");
// const cors = require("cors");
// const port = process.env.PORT || 3000;

// // const multer = require("multer");
// // Inistialise multer for single file upload
// const multer = require("multer");
// const upload = multer({ dest: ".data/" }).single(FILE_UPLOAD_FIELD_NAME);


// // importing custom objects
// const { ProcessesHandler } = require("./utils/process.js");
// var processHandler = new ProcessesHandler();

// const {
//   INITIALISED,
//   RUNNING,
//   COMPLETED,
// } = require("./utils/stateConstants.js");

// const {
//   ExceededProcessesLimitError,
//   ProcessNotFoundError,
//   ProcessExecutedError,
//   ProcessNotCompletedError,
//   ProcessNotRunningError,
// } = require("./utils/processErrors.js");

// // Initialising application
// const app = express();

// // Adding Middlewares on all routes
// app.use(cors({
//   origin: true,
//   methods: ["GET", "POST"],
//   credentials: true
// }));
// app.use(express.static("public"));
// app.use(body_parser.urlencoded({ extended: true }));

// // Defining routes
// app.get("/api", (req, res) => {
//     res.json({
//       message: "API is working!",
//       endpoints: [
//         { method: "POST", path: "/uploadfile", description: "Upload a file" },
//         { method: "POST", path: "/startexecution", description: "Start execution" },
//         { method: "POST", path: "/checkstatus", description: "Check status" },
//         { method: "POST", path: "/viewresults", description: "View results" },
//         { method: "POST", path: "/downloadresults", description: "Download results" },
//       ],
//     });
//   });
// app.get("/", (req, res) => {
//   res.set("Content-Type", "text/html");
//   return res.sendFile(__dirname + "/public/index.html");
// });

// app.post("/uploadfile", upload, async (req, res) => {
//   console.log('Received request:', req.body, req.file); // Debugging line
//   if (req.is("multipart/form-data") === null) {
//     return res.status(400).send({
//       success: false,
//       error: "No body was sent in the request.",
//     });
//   }

//   if (req.is("multipart/form-data") === false) {
//     return res.status(400).send({
//       success: false,
//       error: "The body was not of the type multipart/form-data.",
//     });
//   }

//   if (!req.file) {
//     return res.status(500).send({
//       success: false,
//       error:
//         "There was some error in parsing the file. please try again or contact server admin.",
//     });
//   }

//   try {
//     processHandler.addProcess(req.file.filename, req.file.originalname);
//   } catch (err) {
//     if (err instanceof ExceededProcessesLimitError) {
//       return res.status(500).send({
//         status: false,
//         message: err.message,
//       });
//     }

//     return internalError(err, res);
//   }

//   return res.status(200).send({
//     status: true,
//     data: {
//       fileId: req.file.filename,
//       name: req.file.originalname,
//       size: req.file.size,
//       mimetype: req.file.mimetype,
//     },
//   });
// });


// app.post("/startexecution", async (req, res) => {
//   let time = undefined;
//   if (req.body && req.body.time) {
//     try {
//       time = parseInt(req.body.time);
//     } catch (err) {
//       console.log(err);
//       return res.status(400).send({
//         success: false,
//         error: "'time' should be an integer.",
//       });
//     }
//   }

//   const fileId = getFileId(req, res);
//   if (fileId === null) {
//     return;
//   }

//   try {
//     processHandler.startExecution(fileId, time);
//   } catch (err) {
//     if (isProcNotFoundError(err, res)) {
//       return;
//     }

//     if (isProcExecutedError(err, res)) {
//       return;
//     }

//     return internalError(err, res);
//   }

//   res.status(200).send({
//     success: true,
//     fileId: fileId,
//     message: `The process with fileId '${fileId}' has been initiated`,
//   });
// });

// app.post("/checkstatus", async (req, res) => {
//   const fileId = getFileId(req, res);
//   if (fileId === null) {
//     return;
//   }

//   let progress = null;
//   try {
//     progress = processHandler.getProgress(fileId);
//   } catch (err) {
//     if (isProcNotFoundError(err, res)) {
//       return;
//     }
//     if (isProcNotRunningError(err, res)) {
//       return;
//     }

//     return internalError(err, res);
//   }

//   return res.status(200).send({
//     success: true,
//     fileId: fileId,
//     progress: progress,
//   });
// });

// app.post("/viewresults", async (req, res) => {
//   const fileId = getFileId(req, res);
//   if (fileId === null) {
//     return;
//   }

//   let result = null;
//   try {
//     result = processHandler.viewResults(fileId);
//   } catch (err) {
//     if (isProcNotFoundError(err, res)) {
//       return;
//     }
//     if (isProcNotCompletedError(err, res)) {
//       return;
//     }

//     return internalError(err, res);
//   }

//   return res.status(200).send({
//     success: true,
//     fileId: fileId,
//     data: result,
//   });
// });

// app.post("/downloadresults", async (req, res) => {
//   const fileId = getFileId(req, res);
//   if (fileId === null) {
//     return;
//   }

//   let result = null;
//   try {
//     result = processHandler.getResult(fileId);
//   } catch (err) {
//     if (isProcNotFoundError(err, res)) {
//       return;
//     }
//     if (isProcNotCompletedError(err, res)) {
//       return;
//     }

//     return internalError(err, res);
//   }

//   res.setHeader("content-disposition", "attachment; filename=" + result);

//   let filePath = path.resolve(__dirname, ".data/", result);

//   res.status(200).download(filePath, (err) => {
//     if (err) {
//       console.log(
//         "Error in /downloadresults enpoint in the res.download function."
//       );
//       throw err;
//     }

//     fs.unlink(filePath, (err) => {
//       if (err) {
//         console.log("Error in /downloadresults enpoint while removing the file using fs.unlink");
//         throw err;
//       }
//     });
//   });
// });

// // app.listen(process.env.PORT, () => {
// //   console.log(`The API is listening at ${process.env.PORT}`);
// // });

// // Helper functions
// function getFileId(req, res) {
//   let fileId = null;
//   if (req.body && req.body.fileId) {
//     fileId = req.body.fileId;
//   } else {
//     res.status(400).send({
//       success: false,
//       error: "Did not find 'fileId' in the body.",
//     });
//   }

//   return fileId;
// }

// function isProcNotFoundError(err, res) {
//   if (err instanceof ProcessNotFoundError) {
//     res.status(400).send({
//       success: false,
//       error: err.message,
//     });
//     return true;
//   }
//   return false;
// }

// function isProcExecutedError(err, res) {
//   if (err instanceof ProcessExecutedError) {
//     res.status(400).send({
//       success: false,
//       error: err.message,
//     });
//     return true;
//   }
//   return false;
// }

// function isProcNotRunningError(err, res) {
//   if (err instanceof ProcessNotRunningError) {
//     res.status(400).send({
//       success: false,
//       error: err.message,
//     });
//     return true;
//   }
//   return false;
// }

// function isProcNotCompletedError(err, res) {
//   if (err instanceof ProcessNotCompletedError) {
//     res.status(400).send({
//       success: false,
//       error: err.message,
//     });
//     return true;
//   }
//   return false;
// }

// function internalError(err, res) {
//   console.log(err);
//   return res.status(500).send({
//     status: false,
//     message:
//       "An internal error occurred. Please try again or contact system admin.",
//   });
// }

// app.listen(port, () => {
//     console.log(`The API is listening at http://localhost:${port}`);
//   });


const express = require("express");
const body_parser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { ProcessesHandler } = require("./utils/process");
const {
  ExceededProcessesLimitError,
  ProcessNotFoundError,
  ProcessExecutedError,
  ProcessNotCompletedError,
} = require("./utils/processErrors");

const FILE_UPLOAD_FIELD_NAME = "upload_file";
const upload = multer({ dest: ".data/" }).single(FILE_UPLOAD_FIELD_NAME);
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, methods: ["GET", "POST"], credentials: true }));
app.use(express.static("public"));
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());  // Ensure JSON body parsing

// Initialize Process Handler
var processHandler = new ProcessesHandler();

// API Root
app.get("/api", (req, res) => {
  res.json({
    message: "API is working!",
    endpoints: [
      { method: "POST", path: "/uploadfile", description: "Upload a file" },
      { method: "POST", path: "/startexecution", description: "Start execution" },
      { method: "POST", path: "/checkstatus", description: "Check status" },
      { method: "POST", path: "/viewresults", description: "View results" },
      { method: "POST", path: "/downloadresults", description: "Download results" },
    ],
  });
});

// Serve index.html for root path
app.get("/", (req, res) => {
  res.set("Content-Type", "text/html");
  return res.sendFile(__dirname + "/public/index.html");
});

// Endpoint to handle file uploads
app.post("/uploadfile", upload, async (req, res) => {
  if (!req.file) {
    return res.status(500).send({
      success: false,
      error: "Error parsing the file. Please try again or contact server admin.",
    });
  }

  try {
    processHandler.addProcess(req.file.filename, req.file.originalname);
  } catch (err) {
    if (err instanceof ExceededProcessesLimitError) {
      return res.status(500).send({
        status: false,
        message: err.message,
      });
    }
    return internalError(err, res);
  }

  return res.status(200).send({
    status: true,
    data: {
      fileId: req.file.filename,
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

// Endpoint to start execution
app.post("/startexecution", async (req, res) => {
  const fileId = req.body.fileId;
  if (!fileId) {
    return res.status(400).send({
      success: false,
      error: "Did not find 'fileId' in the body.",
    });
  }

  let time = 10;
  if (req.body.time) {
    try {
      time = parseInt(req.body.time);
    } catch (err) {
      return res.status(400).send({
        success: false,
        error: "'time' should be an integer.",
      });
    }
  }

  try {
    processHandler.startExecution(fileId, time);
  } catch (err) {
    if (err instanceof ProcessNotFoundError || err instanceof ProcessExecutedError) {
      return res.status(400).send({ success: false, error: err.message });
    }
    return internalError(err, res);
  }

  res.status(200).send({
    success: true,
    fileId: fileId,
    message: `The process with fileId '${fileId}' has been initiated`,
  });
});

// Endpoint to check status
app.post("/checkstatus", async (req, res) => {
  const fileId = req.body.fileId;

  try {
    const status = processHandler.getProcessStatus(fileId);
    res.status(200).json({
      success: true,
      fileId: fileId,
      status: status,
    });
  } catch (error) {
    if (error instanceof ProcessNotFoundError || error instanceof ProcessNotCompletedError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    console.error(`Error checking status for fileId ${fileId}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to check status for fileId ${fileId}.`,
    });
  }
});

// Endpoint to view results
const { v4: uuidv4 } = require('uuid'); // Import uuid for generating unique IDs

app.post("/viewresults", async (req, res) => {
  const fileId = req.body.fileId;

  try {
    const results = processHandler.viewResults(fileId);

    // Generate random data for demonstration
    const randomData = {
      id: uuidv4(), // Generate a random UUID
      timestamp: new Date().toISOString(), // Current timestamp
      data: Math.random() * 100, // Random number for demo
      file: fileId // File ID from request
    };

    res.status(200).json({
      success: true,
      fileId: fileId,
      results: randomData,
    });
  } catch (error) {
    if (error instanceof ProcessNotFoundError || error instanceof ProcessNotCompletedError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    console.error(`Error retrieving results for fileId ${fileId}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to retrieve results for fileId ${fileId}.`,
    });
  }
});

// Endpoint to download results


app.post("/downloadResults", async (req, res) => {
  const fileId = req.body.fileId;
  const filePath = path.resolve(__dirname, ".data", fileId); // Adjust as per your file structure

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found for fileId ${fileId}`);
    }

    // Set headers for file download
    res.setHeader("Content-Type", "image/png"); // Adjust based on your file type
    res.setHeader("Content-Disposition", `attachment; filename=${fileId}`);

    // Stream the file as binary data
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(`Error downloading results for fileId ${fileId}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to download results for fileId ${fileId}.`
    });
  }
});


// Handle internal server errors
function internalError(err, res) {
  console.error(err);
  return res.status(500).json({
    success: false,
    error: "An internal server error occurred. Please try again later.",
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
