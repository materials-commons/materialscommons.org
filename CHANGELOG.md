# Release Notes

## 31 October 2016
- :star: **New Feature:**
- :star: **New Feature:**
- :star: **New Feature:**
- :star: **New Feature:**
- :boom: **Fixed:**
- :boom: **Fixed:**
- :boom: **Fixed:**
- :boom: **Fixed:**

## 23 September 2016
### Materials Commons Data
- :star: **New Feature:** MC Data now includes provenance details in an outline structure
- :star: **New Feature:** Ability to search datasets on MC Data
- :star: **New Feature:** Numerous updates to the details presented for a dataset on MC Data
- :boom: **Fixed:** Various bug fixes

### Materials Commons Projects
- :star: **New Feature:** First release of the graphical workflow editor
- :boom: **New Feature:** Various bug fixes


## 3 August 2016
- :star: **New Feature:** Datasets that have not been published can now be deleted.
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