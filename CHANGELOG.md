# Release Notes

## 28 November 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** Materials Commons Python API (documentation coming) [Repo](https://github.com/materials-commons/mcapi).
- :star: **New Feature:** Files can be linked to samples.
- :star: **Improvement:** Performance improvements. Various pages now load much faster.
- :star: **Improvement:** Various backend changes to templates in preparation for future features.
- :boom: **Fixed:** Updating dataset features was too restrictive.
- :boom: **Fixed:** Other bug fixes

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
- :boom: **Fixed:** Other bug fixes

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :star: **New Feature:** Add reset password link so users who forgot their password can reset it.
- :boom: **Fixed:** Dataset download files were not built correctly.
- :boom: **Fixed:** Browse by tag wasn't showing all tags
- :boom: **Fixed:** Other bug fixes

## 23 September 2016
### [Materials Commons Projects](https://materialscommons.org/mcapp)
- :star: **New Feature:** First release of the graphical workflow editor
- :boom: **New Feature:** Various bug fixes

### [Materials Commons Data](https://materialscommons.org/mcpub)
- :star: **New Feature:** MC Data now includes provenance details in an outline structure
- :star: **New Feature:** Ability to search datasets on MC Data
- :star: **New Feature:** Numerous updates to the details presented for a dataset on MC Data
- :boom: **Fixed:** Various bug fixes

## 3 August 2016
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
