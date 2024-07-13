# File-Processing-API

Overview
MyAPI is a Node.js application that provides various endpoints for processing and retrieving results associated with specific file IDs. Below is the detailed documentation for each endpoint.

Base URL
http://localhost:3000  (all the below commands are in reference to this url , if you want to use some specified url , you must change that in server.js

Endpoints
1. /processfile
 
 Description: Uploads a file to the server and returns a fileId to track the file.

Command to execute in command prompt or linux-based systems - curl -F "file=@path/to/your/file.txt" http://localhost:3000/upload

2. /startexecution

Description: Initiates the processing of a previously uploaded file and returns a fileId to track the process. Currently it just waits for sometime and returns that file is processed.

Command to execute in command prompt or linux-based systems - curl -X POST -H "Content-Type: application/json" -d "{\"fileId\":\"<your_file_id_here>\"}" http://localhost:3000/startexecution

3. /viewstatus

Description: Retrieves the status of a processed file based on the provided fileId.

Command to execute in command prompt or linux-based systems- curl -X POST -H "Content-Type: application/json" -d "{\"fileId\":\"<your_file_id_here>\"}" http://localhost:3000/viewstatus

4. /viewresults

Description: Retrieves the results of a processed file based on the provided fileId.

Command to execute in command prompt or linux-based systems- curl -X POST -H "Content-Type: application/json" -d "{\"fileId\":\"<your_file_id_here>\"}" http://localhost:3000/viewresults

5. /downloadresults

Description: Downloads the results file for a processed file based on the provided fileId.

Command to execute in command prompt or linux-based systems- curl -o result_file -X POST -H "Content-Type: application/json" -d "{\"fileId\":\"<your_file_id_here>\"}" http://localhost:3000/downloadresults


All endpoints return a JSON response with a success field indicating whether the request was successful. If an error occurs, the response includes an error field with a descriptive message.

This API allows users to upload files, start processing, view status, view results, and download the results. It's deployed on an AWS EC2 instance and accessible via the provided public URL - http://13.200.152.200:3000
