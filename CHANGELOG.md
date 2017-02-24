# Release Notes

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
- :star: **New Feature:** 
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
