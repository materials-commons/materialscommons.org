# Overview
Materials Commons allows you to easily load data from a spreadsheet. We call this process ETL, 
which stands for (E)xtract, (T)ransform, and (L)oad. As long as you follow a couple of simple
rules Materials Commons can read your spreadsheet and automatically create the samples,
processing steps, measurements and process attributes.

## Format

There are 3 required rules to follow when constructing a spreadsheet for MaterialsCommons to process.
All other rules are optional.

  1. The first column contains the names of your samples
  2. The first row consists of headers
  3. Each processing step must be in a separate sheet. The processing step will have the same name as the sheet.
  
This will look as follows:

| Sample Name | Attribute 1 | Attribute2 |
| ----------- | ----------- | ---------- |
|  Sample 1   |   4.0       | 5          |
|  Sample 2   |   4.1       | 5.01       |


By default Attributes are considered process attributes. To see how to specify sample attributes
see "Sample Attributes".

## Units
To include units you add them into your attribute header in between paranthesis. For example
Attribute 1(mm) means that all measurements for Attribute 1 are in mm.

Your spreadsheet would now look as follows:

| Sample Name | Attribute 1 (mm) | Attribute2 (s) |
| ----------- | ---------------- | -------------- |
|  Sample 1   |   4.0            | 5              |
|  Sample 2   |   4.1            | 5.01           |

## Specifying Column Types

Your first column must be the sample names. After this you can control how MaterialsCommons will
interpret each column. To do this you use keywords. A keyword is a special word that MaterialsCommons
understands followed by a colon. Keywords are case insensitive. For example file: is a keyword. You
can type it as file:, File:, FILE:, fILe:, any of these combinations will work. A keyword must appear
as the first word in your column header. MaterialsCommons will ignore any extra whitespace before
the keyword.

Currently Materials Commons understands the following keywords

| Keyword | Meaning |
| ------- | ------- |
| s, sample, sample attribute | Column specifies a sample attribute |
| p, process | Column specifies a process attribute (remember by default columns are process attributes, so this is optional)|
| f, file, files | Column specify a file |
| i, ignore, note, notes | Column is ignored and not processed |

Here is an example using some of these keywords

| Sample Name | s:GS(mm) | p:Time(sec) | p: Temp (k) | note: | i:is valid? | file:P1/Dir1/Dir2 |
| ----------- | ---------------- | ------------ | ----------------- | ---- | --------- | --------------- |
| S1          | 42               | 100          | 400               | some flux | yes | image.jpg |