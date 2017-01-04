tests for the js-based backend at **`materialscommons.org/servers/mcapi`**

`cd materials-commons/materialscommons.org/backend/tests`
`mocha --compilers js:babel-core/register "**/specs/*-spec.js" --reporter mochawesome`

also, from the top level directory, this will work:

`npm test`
