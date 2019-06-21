The Materials Commons
=====================



Introduction
------------

The Materials Commons is an information repository and collaboration platform specifically designed for the materials community. 
The Materials Commons provides a common place for researchers to store project files and data with provenance information, privately 
share it with collaborators, and then publish completed datasets for the entire community to use. 

This document is the Materials Commons data model and rules specification. It will be versioned and kept up-to-date it evolves. 
It is also intended to be a reference document with a high-level overview for new users and devopers along with links to the API 
calls that perform the specific actions described in the specification. 

There may be some places in which the current implementation of Materials Commons differs from the specification. 
This difference may be intentional (small design change), unintentional (bug), or due to incomplete implementation. 
To the extent possible, these differences will be noted.


Overview
--------

This overview describes:

1. How information is organized and shared in Materials Commons
2. How project data and provenance information are stored and accessed, with a basic example. 
3. How datasets are published and downloaded. 


### Organization and permissions

A Materials Commons "user" has a username, a password, and an API key which is used to determine permission to perform all actions in Materials Commons. 

#### Project

A "project" is the most basic unit of organization in Materials Commons.

The user who created the project is designated the project owner and has the ability to add and remove project collaborators. 

All data objects in the Materials Commons are owned by a user and a project, which defaults to the user who created the data object and the project the data object was initially created in. All data objects must be owned by one and only one user and owned by one and only one project. Only the user-owner can change user-ownership or project-ownership of a data object.

There is a distinction between data objects "owned by" a project and file and data objects "in" a project. All data objects "owned by" a project are "in" a project, but not vice versa. Project collaborators are users who have read permission for all data objects "in" a project, and read and write permission for all data objects "owned by" a project. 

#### Files and Directories

A project has a directory heirarchy associated with it, comprising of a top level directory, sub-directories, sub-sub-directories, etc. Each directory stores its parent directory, its sub-directories, and a list of file objects. All file objects are stored within a directory. 

"Creating" a file currently consists of uploading the file to Materials Commons and creating a data object that references that file. In the future, it may consist of creating a data object that references the file and provides information such as a url for how to obtain the file without requiring it be uploaded to Materials Commons. So in this document "creating" a file will imply creating a file data object with a reference that enables Materials Commons to obtain the file, but does not imply uploading it to Materials Commons.

#### Experiment

To describe the work done in a project, collaborators must create sub-units of organization called an "experiment". An "experiment" has a description, and "in" the experiment are stored "sample" and "process" data objects describing, respectively, things associated with the experiment (such as real or virtual material samples) and the actions done to create, use, or transform them. Sample and process objects must be created in a particular experiment. 


### Database objects and provenance

All data objects in Materials Commons have an id, a user-owner, and some metadata such as when the object was created and when it was last modified. Most data objects also have a name, a description, a project-owner, and a list of projects and experiments that the object is "in".

A brief overview of the data objects that are used to store data and provenance in the Materials Commons database:

#### Process 

A "process" data object represents an action.

A process can be an experimental action such as receiving materials from a particular source, preparing a sample, or running a test and making measurements. A process can also be a computational process, like a simulation or an analysis.

A process is described through the specification of its attributes and what objects it has created, used, or transformed. 

#### Sample

A "sample" data object represents a thing, and in particular a thing that can be transformed via a series of processes.

A sample can represent something real and concrete, like a specific experimental specimen. A sample can also be something virtual and concrete, like a virtual sample input to a simulation. Or a sample could be something conceptual, like a type of material (for example, a specific alloy after a particular processing) or a materials component (for example, a particular phase, interface, dislocation, or point defect). All samples are described as being created by a process, even if it a trivial process.

A sample is described through the specification of its attributes and how they are transformed via processes. 

#### Attribute

An "attribute" data object describes some aspect of a sample or process.

Attributes have a name, a type (scalar, vector, string, any valid JSON, etc.), and units. 

There are no limits on what can be represented as a sample attribute and in general it will depend on the context in which they are used. Typical attributes of a sample may include descriptions of structure (size, shape, composition, lattice parameters, microstructure, etc.) or properties (hardness, tensile strength, total energy, magnetic moment, band gap, etc.). 

Process attributes typically include descriptions of processing or instrument parameters (temperature, time, instrument or method used) or calculation parameters (software or hardware used, numerical methods or parameters). 

A single attribute data object may be used to describe more than one sample or process, and may be used to describe both samples and processes. For example, if to the degree it matters the composition is the same among tensile test specimens created from the same material, then it would be appropriate to use the same composition attribute object for the sample data object representing each specimen. As an example of sharing an attribute between both samples and processes, it may be desireable to have a heat treatment temperature be an attribute of both the heat treatment process and the samples that are heat treated.

*Notes:*

- *Process attributes are currently implemented using a similar, but more limited object, "setup properties", which cannot be shared or be directly linked to a process which determines its value. Users have found these features desireable and are currently using input samples to represent these relationships, so this section represents a near term change to the data model to use "attribute" objects for processes in addition to samples.*

- *There are no restrictions on attribute names. Thus, it is up to the user to determine how to identify attributes that are equivalent in meaning but have different names.*


#### Attribute value

An attribute value data object stores a particular value of an attribute and how it was determined. 

Depending on the context there may be 0, 1, or more values associated with an attribute. As examples, the attribute value may be unknown, it may be uniquely determined, it may vary from observation to observation, it may be dependent on the process used to calculate or measure it, or it may be desireable to record both individual observations and statistics. To flexibly treat these types of situations, Materials Commons can associate multiple attribute value data objects with an attribute. 
  
The attribute value data object is also be used to record uncertainty in the value and the process used to determine the value.
  
*Notes:*

- *Attribute value is currently called "measurement", which is restricted to sample attributes.*

#### Attribute set

An attribute set data object represents a group of attributes that are related in some way.  

For example, material structure-property relationships can be indicated by including structure attributes, like composition and microstructure descriptions, and property attributes, like tensile strength and hardness, in the same attribute set.

As another example, a sample object with a single attribute set may be used to represent a set of calculation parameters that are used in multiple calculations. 

Pairs of attribute sets are also used to represent transformations, and attribute sets can identify, if applicable, related attribute sets before and after transformational processes. In particular, the sample data object represents objects that may undergo a series of transformations by specifying a series of attribute sets that are associated with the sample state after each transformation.

Attributes of a process are also represented using an attribute set.

*Notes:*

- *Process attributes are currently implemented using a similar, but more limited object, "setup properties", which cannot be shared or be directly linked to a process which determines its value. Users have found these features desireable and are currently using input samples to represent these relationships, so this section represents a near term change to the data model to use "attribute" objects for processes in addition to samples.*
  

### Basic Example

As an example, a process named "receive material" creates a sample with an initial sample attribute set, "sample\_0\_attrset\_0", containing:

- a attribute named "composition", with id "composition\_0"
- a attribute named "grain size", with id "grainsize\_0"
- a attribute named "hardness", with id "hardness\_0"

all of unknown value (no measurements). Subsequently, a "heat treatment" process could transform the sample's grain size and hardness without affecting the sample's composition. In Materials Commons this would be represented by creating a new sample attribute set, "sample\_0\_attrset\_1", containing:

- the original "composition" attribute, with id "composition_0"
- a new "grain size" attribute, with id "grainsize\_1"
- a new "hardness" attribute with id "hardness\_1"

Note that sample attributes may be included in more than one sample attribute set, if they do not change when other sample attributes do. Since attribute values are associated with particular sample attribute objects (i.e. "grainsize\_0", not "grain size" which could be "grainsize\_0" or "grainsize\_1"), it is unambiguously specified whether they apply to the attribute before or after transformation.  

Additionally, a process attribute set, "heat\_treatment\_attrset", associated with the "heat treatment" process would contain:

- the temperature of the heat treatment attribute, "heat\_treatment\_temperature"
- the time of the heat treatment attribute, "heat\_treatment\_time"

Subsequently, as experiments are performed to measure the value of the composition, grain size, and hardness attributes, process and attribute value objects are created. For each attribute value object, Materials Commons stores which attribute object it is a value of and which process object describes the process used to determine the value.

Following this model, a researcher can perform queries of the Materials Commons database to find all heat treatment processes, the time and temperature of the heat treatments, the composition of the samples being heat treated, and their grain size and hardness before and after the heat treatment, and any information necessary to describe how those measurements were performed.


### Publishing datasets

The basic unit of publication in Materials Commons is a "dataset". A dataset is created by selecting a subset of samples and processes in a project and associated files, measurements, etc. are included in the dataset.
