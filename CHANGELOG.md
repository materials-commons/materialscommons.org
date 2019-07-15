# Release Notes

## July 2019
- :star: **New Feature:** Published datasets can be downloaded using Globus
- :star: **New Feature:** Publish private datasets to Globus
- :star: **New Feature:** Publish datasets moved to project level
- :star: **New Feature:** 
- :star: **New Feature:** 
- :star: **Improvement:**
- :boom: **Fixed:** Creating an account with an existing email address didn't return an error
- :boom: **Fixed:** Cancel button on login wasn't doing anything
- :boom: **Fixed:** 

## June 2019
- :star: **New Feature:** Add support for ignoring columns in ETL
- :star: **New Feature:** Project level publishing allows recursive file selection
- :star: **New Feature:** New APIs to get and set Metadata on various objects in system
- :star: **New Feature:** Beta support for publishing datasets to a Globus endpoint
- :star: **New Feature:** Beta support for downloading published datasets using Globus
- :star: **New Feature:** Owners of projects can now transfer their project ownership to another project user
- :star: **New Feature:** Add API call to get all new files added to a project during a date range
- :star: **Improvement:** Add notes as an ignored keyword for spreadsheet processing

## May 2019
- :star: **New Feature:** Add support for ignoring cells in ETL
- :star: **New Feature:** Add support for actions in ETL
- :star: **New Feature:** Beta simple search of matching samples by process attributes
- :star: **New Feature:** Add support for Files in ETL
- :star: **New Feature:** Add support for spreadsheets with no parent column
- :star: **Improvement:** Handle extra starting/trailing spaces in headers and value cells
- :boom: **Fixed:** Various project level publishing fixes

## April 2019
- :star: **New Feature:** Added backend support for new ETL process
- :star: **New Feature:** New ETL format in Beta
- :star: **New Feature:** New ETL a second format is now supported for reading a spreadsheet without specifying a workflow
- :star: **New Feature:** Set best measure on sample attributes
- :star: **New Feature:** Show experiments being loaded from a spreadsheet as in progress until they are done loading or error
- :star: **Improvement:** File details page now gives access to file versions
- :star: **Improvement:** File details page shows processes and samples
- :star: **Improvement:** Filter by samples in workflow now filters as you choose a sample
- :star: **Improvement:** Filter by samples in workflow allows search and filter on search
- :boom: **Fixed:** DOI Publishing in project datasets now generates a DOI
- :boom: **Fixed:** Workflow process outline did not have a scrollbar

## March 2019
- :star: **Improvement:** Issue #1316 New interface for interacting with files
- :star: **Improvement:** ETL Processing now performed in a background task
- :star: **Improvement:** Lots of improvements and simplifications to the backend services
- :boom: **Fixed:** Issue #1381 Deleting a file was leaving some artifacts in the database
- :boom: **Fixed:** Issue #1392 ETL wasn't properly handling root files


## Feb 2019
- :star: **Improvement:** Issue #1315 Add sort to all columns in samples table, except experiment and modification time (We already group by experiment)
- :star: **Improvement:** Issue #1363 Clicking on file in the details list of a directory brings up a modal displaying the file
- :star: **Improvement:** Issue #1311 Improvements to the Account Overview page
- :star: **Improvement:** Issue #1365 Improved adding papers to datasets
- :star: **Improvement:** Issue #1366 Improved adding authors to datasets
- :star: **Improvement:** Issue #1324 Show papers related to the dataset
- :star: **Improvement:** Issue #1325 Allow individual files to be downloaded from a dataset
- :star: **Improvement:** Issue #1370 Show counts of datasets at project level
- :star: **Improvement:** Issue #1306 Help user identify what their globus id is
- :star: **Improvement:** Issue #1286 Help user understand that datasets are for publishing
- :star: **Improvement:** Issue #1298 Open separate browser tabs without have to login again on each tab
- :star: **Improvement:** Issue #1335 Add ability to view raw json for various objects in the UI
- :star: **Improvement:** Issue #1287 Explains counts on create dataset popup
- :star: **Improvement:** Issue #1289 Improve explanation of what can change when publishing a dataset
- :star: **Improvement:** Issue #1378 Add processes to sidebar and implement a process overview page
- :star: **Improvement:** Issue #1377 Add a bunch of information to samples and turn into a full page
- :boom: **Fixed:** Issue #1302 When creating a project level note for the first time the note wouldn't show up without doing a refresh
- :boom: **Fixed:** Issue #1360 Files added directly to a dataset were not showing up
- :boom: **Fixed:** Issue #1361 The view button in the workflow for a published dataset was not doing anything
- :boom: **Fixed:** Issue #1362 Published datasets not showing file count
- :boom: **Fixed:** Issue #1362 Published datasets not showing file count
- :boom: **Fixed:** Issue #1317 Click on file in "experiment files" wouldn't display the file
- :boom: **Fixed:** Issue #1359 Couldn't upload files into a project level dataset
- :boom: **Fixed:** Issue #1327 No scrollbar on long lists of files in published datasets
- :boom: **Fixed:** Issue #1330 "Show Process Details" menu item now shows all the process details
- :boom: **Fixed:** Issue #1369 Projects REST API returning deprecated field
- :boom: **Fixed:** Issue #1368 Reduce the amount of information sent about a user

## Jan 2019
- :star: **Improvement:** Issue #1310 Change ? To "HELP" in Navbar
- :star: **Improvement:** Issue #1299 Show Project Id on project description page
- :star: **Improvement:** Issue #1313 Show a single list of projects (rather than 2 lists depending on owner/member)
- :star: **Improvement:** Issue #1281 Cleaned up help on login page to reference materials commons rather than the projects site
- :star: **Improvement:** Issue #1280 Allow users to choose which page to login to (projects or published data)
- :star: **Improvement:** Issue #1284 Allow clicking outside of dialog to close it
- :star: **Improvement:** Issue #1301 Sort users on collaborators page by last name

## Nov 2018
- :star: **Beta:** Globus for Upload/Download without login.
- :star: **Beta:** ETL modified to work from files already uploaded to Project.
- :boom: **Fixed:** Bug fixes and layout changes.

## October 2018
- :star: **Beta:** Globus Upload/Download with user login.
- :star: **Beta:** ETL improvements and integration with Globus.
- :star: **Beta:** Publishing at the project level.

## July 2018
- :star: **Workshop:** Changes in preparation for the workshop (publishing, ETL, Globus, Python API).
- :boom: **Fixed:** Bug fixes and layout changes.

## June 2018
- :star: **Beta:** Publishing at the Project Level.
- :star: **Beta:** ETL Improvement
- :boom: **Fixed:** Bug fixes and layout changes.

## May 2018
- :star: **Alpha:** Globus Integration.
- :star: **Alpha:** ETL.
- :star: **Alpha:** Publishing at the Project Level.
- :boom: **Fixed:** Bug fixes and layout changes.

## April 2018
- :star: **Alpha:** Globus Integration.
- :star: **Alpha:** Changes related to Python API.
- :boom: **Fixed:** Bug fixes and layout changes.

## March 2018
- :star: **New Feature:** Lots of behind the scenes work to prepare for automated spreadsheet upload and publishing improvements.
- :star: **Improvement:** Small changes to publishing to help guide a user when they can publish.
- :boom: **Fixed:** Bug fixes and layout changes.

## February 2018
- :star: **New Feature:** New navigation sidebar in the UI makes navigation much easier.
- :star: **New Feature:** Project notes and todos. The notes accept markdown syntax.
- :star: **New Feature:** The sidebar allows users to add top level directory shortcuts into the bar. It also includes 3 standard directories.
- :star: **New Feature:** New projects are now created with 3 default directories and shortcuts.
- :star: **Improvement:** Scrolling in the UI has been improved across all pages.
- :star: **Improvement:** A number of pages were changed in the UI to improve usability.
- :boom: **Fixed:** A number of UI bugs were fixed.

## January 2018
- :star: **New Feature:** We are doing a bunch of work behind the scenes to enable command line upload of data and workflow.
- :star: **Improvements:** A lot of work went into testing and squashing bugs.

## November 2017
- :star: **New Feature:** Add comments section to public datasets.
- :star: **New Feature:** Add download and view statistics to public datasets.
- :star: **Improvement:** File upload easier to use. Now shows thumbnails of image files to be uploaded.
- :star: **Improvement:** Drag and drop for moving files improved.
- :star: **Improvement:** Multiple changes to UI state improved and fixed so that operations on files are displayed in the UI.
- :boom: **Fixed:** Other miscellaneous bug fixes.

## October 2017
- :star: **New Feature:** Merge experiments - Experiments can now be merged into a single experiment. This allows you to do your work in separate experiments then publish/view as a single whole. Original experiments are kept.
- :star: **New Feature:** Delete experiments - Experiments can now be deleted when using the web application.
- :star: **New Feature:** Delete projects - Projects can now be deleted when using the web application.
- :star: **New Feature:** Refresh view - Users can control when the want to refresh their projects with the latest information from the server.
- :star: **Improvement:** A number of performance improvments were made. Projects and experiments will now load much faster. Deletes are now nearly instantaneous.
- :star: **Improvement:** The details page for a public dataset has been reworked to reduce scrolling and make finding the different sections easier.
- :boom: **Fixed:** Experiments with large numbers of files would appear to hang. Now they load very quickly.
- :boom: **Fixed:** Clicking on tags in the public datasets didn't do anything. Now clicking on a tag takes you to all the datasets associated with that tag.
- :boom: **Fixed:** Other miscellaneous bug fixes.

## August 2017
Performance improvements and changes related to the upcoming Python API release and PRISMS workshop in August.

## 25 July 2017
### [Materials Commons Projects](https://materialscommons.org/)
This release integrated the Materials Commons Data and Materials Commons Projects sites together. The data site is now
the home page for both sites. In addition this release made significant improvements to the workflow editor, and added
the workflow graph and outline to the published data site. Lastly a first version of the template editor for creating
and editing process templates is being released.
- :star: **New Feature:** Integrated the Projects and Data sites together. Data pages now share the same look and feel as the proojects site.
- :star: **New Feature:** Workflow Editor - Expand/Collapse nodes.
- :star: **New Feature:** Workflow Editor - Hide/Hide Other nodes.
- :star: **New Feature:** Workflow Editor - Added filter by samples.
- :star: **New Feature:** Workflow Editor - Added filter by processes.
- :star: **New Feature:** Workflow Editor - Added tooltips to nodes and edges.
- :star: **New Feature:** Workflow Editor - Added showing/hiding sidebar with details, filters, and add tab.
- :star: **New Feature:** Workflow Editor - Added sidebar tab to easily add multiple nodes to graph.
- :star: **New Feature:** Workflow Editor - Allow multiple nodes/edges to be selected by shift click and shift and draw box.
- :star: **New Feature:** Workflow Editor
- :star: **New Feature:** Workflow Editor
- :star: **New Feature:** Added workflow visualization to data site details.
- :star: **New Feature:** Template editor with the ability to create new templates. Admin users can edit any template.
- :star: **Improvement:** Workflow Editor - Edge names now indicate if there is more than one sample.
- :star: **Improvement:** Workflow Editor - Improved file/sample linking and showing the linked items.
- :star: **Improvement:** Upgraded cytoscape dependencies.
- :star: **Improvement:** Notes section now displays no notes in a more friendly way.
- :boom: **Fixed:** Various reports that had blank fields for samples and files.
- :boom: **Fixed:** Cannot delete datasets that have a DOI assigned to them.
- :boom: **Fixed:** Other miscellaneous bug fixes.

## 26 June 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
This release focused on improvments to the workflow editor.
- :star: **New Feature:** Reworked the process for picking templates to reduce clicks. Templates that are used, float to the top.
- :star: **New Feature:** Separated clone and add into separate buttons rather than in a drop down item to reduce clicks.
- :star: **New Feature:** Added right click to delete a workflow node.
- :star: **New Feature:** Added right click to add a child node and automatically bring over samples.
- :boom: **Fixed:** Other miscellaneous bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
No changes. We are working on directly integrating the two materials commons sites together.

### [Materials Commons Python API](https://github.com/materials-commons/mcapi)
This release focused on documentation and upload speed. We are also exploring using the API to create scripts to automate workflow creation.
- :star: **New Feature:** [Help pages](https://materials-commons.github.io/python-api/) available on API.
- :star: **New Feature:** Parallel file upload introduced to improve multi-file upload speeds.
- :star: **Improvement:** Other miscellaneous fixes and small features.

## 31 May 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
This release focused on improvements to the publishing process. Support for DOIs was added to the system.
- :star: **New Feature:** DOI Support added to publishing datasets.
- :star: **Improvement:** Updates related to API support.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
This release focused on improvements to the publishing process. Support for DOIs was added to the system.
- :star: **New Feature:** DOI Support added to publishing datasets.

## 28 April 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** A new template builder has been released to a limited set of beta users. The template builder will allow users to create new process templates and modify existing templates.
- :star: **New Feature:** Added the ability to rename projects.
- :star: **New Feature:** Office documents (Excel, Word, and PowerPoint) can now be viewed online as PDFs.
- :star: **Improvement:** The look and feel for account request and password reset emails was improved.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :star: **Improvement:** The public data site now loads much faster.
- :star: **Improvement:** The site now gives feedback to the user when performing long operations.
- :star: **Improvement:** The look and feel for account request and password reset emails was improved.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Python API](https://materialscommons.org/mcpub)
- :star: **New Feature:** Added the ability to delete projects, experiments, files and other items.
- :star: **Improvement:** Added the ability to rename objects on the server.
- :boom: **Fixed:** Other bug fixes.

## 31 March 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
This release focused on ease of use and workflow improvements. Notably we added the ability to clone processes.
- :star: **New Feature:** Ability to clone a process. When cloning a process you have full control over files and samples.
- :star: **New Feature:** Added reminders to projects, this shows up in the new projects overview.
- :star: **New Feature:** Added description separate from overview for a project. This shows up in the projects overview.
- :star: **New Feature:** Added affiliation for users.
- :star: **Improvement:** UI now shows file and sample links.
- :star: **Improvement:** Improved linking files and samples by allowing a file to be linked to multiple samples.
- :star: **Improvement:** Changed look and feel of experiment overview in project home page. Additional information added to experiment overview.
- :star: **Improvement:** Change projects list to a table. Allowed sorting on columns. Added an overview for a project (more improvements will be added to overview).
- :star: **Improvement:** Demo project building added as button on projects page. You can also hide this without building a demo project. Demo project builder remains in window.
- :star: **Improvement:** Demo project building speed improved (from almost a minute down to seconds).
- :star: **Improvement:** Show user name rather than email address in various places (most notably in the navbar).
- :star: **Improvement:** Other small improvements.
- :boom: **Fixed:** Processes with large numbers of files (thousands) causing problems. Now limited files display to 50 for now.
- :boom: **Fixed:** Auto save was causing cursor to jump around. Increased timeout so this doesn't happen.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
There were small changes made to the navigation bar.
- :star: **Improvement:** Added report a problem link to navbar.
- :star: **Improvement:** Other small changes to the navbar and bug fixes.

### Materials Commons Python API
We are getting closer to an alpha release.


## 23 February 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
This release added a bunch of new features to the graph workflow builder.
- :star: **New Feature:** The workflow graph can now be filtered by sample. This allows you to view only nodes associated with a set of samples.
- :star: **New Feature:** Added the ability to search within the graph workflow, showing only nodes that match the search.
- :star: **New Feature:** Added a right click handler to the graph. When over a node right click to view a 'Show Details' menu popup.
- :star: **New Feature:** Added a toolbar to the workflow containing useful tools.
- :star: **New Feature:** If a node is selected, when adding a new node, the default view for samples to choose from is now filtered to the samples available from the clicked node. You can still choose to see all the available samples.
- :star: **New Feature:** The dropdown menu under your username now allows you to create a demo project.
- :star: **New Feature:** Added the ability to create a birds eye view of your workflow and move around it easily.
- :star: **Improvement:** Increased the size of the graph workflow area.
- :star: **Improvement:** Updates to existing templates, as well as added a set of generic templates.
- :star: **Improvement:** Pan/Zoom and navigate have been improved in the graph view. 
- :star: **Improvement:** Added description field to processes. The editor is fully featured and allows for rich data to be added to the process description.
- :star: **Improvement:** Improved various views to allow to view details, such as process and samples selection.
- :exclamation: **Deprecated:** Removed the ability to set a process template for a task. This feature has been deprecated. Existing tasks with templates still work.
- :boom: **Fixed:** Microsoft documents were treated as viewable, showing binary content. This has been fixed.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
There were no changes made to Materials Commons Data in this release.


## 3 February 2017
### [Materials Commons Projects](https://materialscommons.org/mcapp)
This release of Materials Commons focused on stability and usability improvements.

- :star: **Improvement:** Names were added to the list of users (rather than just email addresses) when choosing users to give access to your project. The whole layout has been changed to improve usability.
- :star: **Improvement:** A help link was added to the projects navbar to make it easier to find.
- :star: **Improvement:** The way that pages scroll has been reworked in this release. This provides better support for small screens.
- :star: **Improvement:** Uploading files to a process has been improved to handle error conditions.
- :star: **Improvement:** The top menu bar now scales appropriately for the screen size.
- :star: **Improvement:** A new drop entry was added to the Heat Treatment template.
- :star: **Improvement:** A number of other miscellaneous usability improvements.
- :boom: **Fixed:** Publishing datasets was failing. This has been fixed.
- :boom: **Fixed:** Other bug fixes.

### Materials Commons Python API
A lot of behind the scenes work was done on our Python library for Materials Commons (Not yet released).
We are close to announcing a beta release.

### [Materials Commons Data](https://materialscommons.org/mcpub)
There were no changes made to Materials Commons Data in this release.


## 21 December 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** First iteration of online help available. You can access this from within the UI. It's also available in the [wiki](https://github.com/materials-commons/materialscommons.org/wiki) on our repo.
- :star: **New Feature:** Files can now be directly uploaded into a workflow process.
- :star: **New Feature:** Additional process templates for PRISMS computational processes were added.
- :star: **New Feature:** The ability to add and update measurements and setup information for processes were added to the [Python API](https://github.com/materials-commons/mcapi).
- :star: **Improvement:** Reduced the number of steps to choose a template in tasks.
- :boom: **Fixed:** Various updates to time/date handling.
- :boom: **Fixed:** Composition wasn't being properly updated in the backend.
- :boom: **Fixed:** Problem with setting units.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
There were no changes made to Materials Commons Data in this release.

## 28 November 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** Materials Commons Python API (documentation coming) [Repo](https://github.com/materials-commons/mcapi).
- :star: **New Feature:** Files can be linked to samples.
- :star: **Improvement:** Performance improvements. Various pages now load much faster.
- :star: **Improvement:** Various backend changes to templates in preparation for future features.
- :boom: **Fixed:** Updating dataset features was too restrictive.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :boom: **Fixed:** File counts for some datasets not displayed correctly.

## 31 October 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** Added template for sample sectioning
- :star: **New Feature:** Add reset password link so users who forgot their password can reset it.
- :star: **New Feature:** Completely redesigned the dataset interface. Added the ability to choose processes from a graph or outline.
- :star: **New Feature:** Added outline view to the workflow editor.
- :star: **New Feature:** Allow users to delete processes in the workflow editor. Ensure that the provenance graph is never made invalid.
- :boom: **Fixed:** Various speed improvements.
- :boom: **Fixed:** Deleting samples could leave provenance graph in an inconsistent state.
- :boom: **Fixed:** Other bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :star: **New Feature:** Add reset password link so users who forgot their password can reset it.
- :boom: **Fixed:** Dataset download files were not built correctly.
- :boom: **Fixed:** Browse by tag wasn't showing all tags.
- :boom: **Fixed:** Other bug fixes.

## 23 September 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** First release of the graphical workflow editor.
- :boom: **New Feature:** Various bug fixes.

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :star: **New Feature:** MC Data now includes provenance details in an outline structure.
- :star: **New Feature:** Ability to search datasets on MC Data.
- :star: **New Feature:** Numerous updates to the details presented for a dataset on MC Data.
- :boom: **Fixed:** Various bug fixes.

## 30 August 2016
- :star: **New Feature:** Datasets that have not been published can now be deleted.
- :star: **New Feature:** Introducing [Materials Commons Data](https://materialscommons.org/mcpub), a new site for publishing research data.
- :boom: **Fixed:** Adding or changing composition on a sample was silently failing on the backend. It appeared to the user that the composition was being saved but then wasn't being displayed when viewing the sample.
- :boom: **Fixed:** Dataset papers was not saving all fields of a paper on the backend. It would appear to the user that system was deleting old entries.
- :boom: **Fixed:** Deleting a task would cause an error saying the note (for the deleted task) couldn't be updated. This error no longer occurs.

## 30 July 2016
- :star: **New Feature:** Tasks associated with a template couldn't be deleted. Now you can delete tasks with unused templates. A template is unused if it doesn't have any files or samples associated with it and isn't being used in a dataset.
- :star: **New Feature:** Change a tasks name or notes will now also update the corresponding process name or notes.
- :star: **New Feature:** Datasets can now be unpublished.
- :star: **New Feature:** A simple table layout was added that shows the files associated with a process.
- :boom: **Fixed:** When clicking on a task sometimes the system would think you were trying to move the task to a different position, where that position is the same as the tasks current position. This would cause an error. Now the condition is checked and no move attempt is made if the task isn't actually being moved.
- :boom: **Fixed:** When adding files to a process they would be saved, but wouldn't always be displayed. Now files are displayed.
- :boom: **Fixed:** Datasets that are published had a link to view the published dataset. This was hard coded to the wrong URL (actually it pointed at Google). It now points at the correct URL.
