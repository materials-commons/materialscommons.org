Using ETL scripts.
==================

Prerequisites
-------------

First, install python3. https://wiki.python.org/moin/BeginnersGuide/Download

Then, use the following to set up and install the materials commons environment
* obtain a copy of your API key
    * log into https://materialscommons.org/
    * click on "Account Settings" in the right-hand pull-down menu (under you name)
    * click on "SHOW API KEY"
    * you will need to copy and save the API key into the configuration file described next
* create an API configuration file
    * the file's location is ~/.materialscommons/config.json
    * the file should contain:
        ```bash
        {
          "apikey": "your-api-key-see-above",
          "mcurl": "https://materialscommons.org/api"
        }
        ``` 
* Test that your configuration is working, but doing the following.
    * create and cd to a test directory
    * install the materials commons package in your python environment
        ```bash
        pip install materials_commons
        pip install openpyxl
        ```
    * create a python script, test.py, with the code in it:
        ```python
        from materials_commons.api import get_all_projects

        for project in get_all_projects():
            print(project.name)

        ```
    * test it with the command:
        ```bash
        python test.py
        ```
    * if that code works you are ready to go

Running Input and Output Processes
----------------------------------

An example input file can be obtained from this location:
https://github.com/materials-commons/mcapi/blob/master/python/materials_commons/etl/artifacts/input.xlsx

Just click on "download" link. 

For the commands, in the form illustrated below, I will assume that you have copied
this file, input.xlsx, to a test directory on your Desktop, e.g. `~/Desktop/test`

Commands to build project/experiment from a spreadsheet and produce a spreadsheet from a project/experiment:

* To create from an excel spreadsheet, a project/experiment or add an experiment to an existing project.
    Note that this script also creates a metadata file.
    * input: annotated spreadsheet (e.g. `--input ~/Desktop/test/input.xlsx`)
    * output: metadata file (e.g. `--metadata ~/Desktop/test/metadata.json`)
    ```bash
    python -m materials_commons.etl.input.main --input ~/Desktop/test/input.xlsx --metadata ~/Desktop/test/metadata.json
    ```

* To create an output excel spreadsheet from a project/experiment and a metadata file. Note: the metadata file 
    contains the database identity of the project and the experiment.
    * input: metadata file (e.g. `--metadata ~/Desktop/test/metadata.json`)
    * output: an excel spreadsheet (e.g. `--output ~/Desktop/test/output.xlsx`)
    ```bash
    python -m materials_commons.etl.output.extract_spreadsheet --metadata ~/Desktop/test/metadata.json --output ~/Desktop/test/output.xlsx 
    ```
    
Running Verification Scripts
----------------------------

Two scripts are available that can help you verify the status of your input and output attempts:
1. `**project_walker.py**` - a script that prints out the project, experiment, workflow (eg process tree),
    and data (set-up parameters, process parameters, measurements); this supports a visual verification of
    the content
2. `**compare_spreadsheets.py**` - a script that uses the metadata.file, the input files, and the output file
    to perform an "intelligent" compare and will either verify that they are the same, or print out differances.
    
Example of the commands that run these scripts, continuing to use the above example 
directory, `~/Desktop/test`, are these:

* To print a "tree-like" description of an the experment's process-workflow, after input from of the spreadsheet 
    has been read into a project's experiment, using the matadata file...
    * input: metadata file (e.g. `--metadata ~/Desktop/test/metadata.json`)
    ```bash
    python -m materials_commons.etl.output.project_walker --metadata ~/Desktop/test/metadata.json
    ``` 
* To compare the input and output excel files 
    * inputs:
        * input excel file (e.g. `--input ~/Desktop/test/input.xlsx`)
        * output excel file (e.g. `--output ~/Desktop/test/output.xlsx`)
        * metadata json file (e.g. `--metadata ~/Desktop/test/metadata.json`)
    * thus:
    ```bash
    python -m materials_commons.etl.output.compare_spreadsheets --input ~/Desktop/test/input.xlsx --output ~/Desktop/test/output.xlsx --metadata ~/Desktop/test/metadata.json
    ```