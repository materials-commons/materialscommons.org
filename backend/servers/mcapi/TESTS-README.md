Running Mocha Tests in mcapi
----------------------------

To run the complete set of these use this command line:
~~~~
mocha "**/specs/*-spec.js" `
~~~~

The `mocha` command should be available, 
but if not, you can add it to the project with
~~~~
# one time install - mocha and istanbul
npm install -g mocha
npm install -g istanbul
~~~~
