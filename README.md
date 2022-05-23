# What is this project?

This project is a sample coding assessment that uses Python (Flask) on the backend to create and expose an API visible to a React frontend. Given a dataset of 10,000 stores, I create an API that achieves various CRUD operations via HTTP methods based on user input, and display the results.

# I don't want to see code, let me see the real thing!

Please check out my app on Heroku: https://sfl-scientific.herokuapp.com/index.html

# Any Figma Designs?

For the purpose of this project, I quickly spun up my own Wireframe you can find here: https://www.figma.com/file/cGgiY4Uhmi01BMOG5PqSiB/SFL-Scientific?node-id=0%3A1

# How do I set up the project locally?

There are 2 moving parts for this project: a Python Flask backend and a React.js frontend. Please make sure Python/pip and Node.js/npm are installed on your machine.

Please note, I myself use a Windows machine, so these instructions will be for Windows specifically. There are however tons of resources out there for the same commands on other Operating Systems.

For the Flask side of things, I used virtualenv to install and freeze my dependencies. After downloading the repo, navigate into it and run the following to ensure you download my dependencies in your own virtualenv.

### `py -m venv venv`
### `venv\Scripts\activate.ps1`
### `pip install -r requirements.txt`

After installing the dependencies from requirements.txt, you can start the backend by running

### `py app.py`

The backend is all setup and should be running on http://localhost:5000 by default.

Now to move onto the React side of things. Navigate into the client folder within the repository. Before we install our dependencies, it's important to make sure our frontend can communicate with our backend. Go into package.json (/client/package.json) and change the line:

### `"proxy": "https://sfl-scientific.herokuapp.com/",`
to
### `"proxy": "http://localhost:5000",`

and save this file.

Finally, we are ready to install our dependencies by running:

### `npm install`

in the client folder.

After this has finished, we can start our development server with:

### `npm start`

or:

### `npm run build`

for a production build. With `npm start`, our frontend should open by default when it's ready, but if not, you can navigate to http://localhost:3000/ to view the app.

# What are next steps?

- Cleanup some API queries.
    - For example, downloading a filtered dataset results in 2 POST queries to the API currently. One to retrieve the data as JSON object and the other to retrieve the file for download.
- Query for Latitude/Longitude and display the nearest results.
    - This is an inherent issue with the way I've set up my application as paginated data containing separate maps for each data point. If I were to create 1 overall large map with 10,000 different markers on the map instead, this kind of query would be more feasible.
- Deploying to AWS instead of Heroku
- Handle addition and rolling-back of datasets.
- Setup Tests! Test-driven development is key to having a working final result.