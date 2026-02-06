# Agent instructions

This repo consists of OGraf graphics templates.

* The OGraf specification can be found at instructions\specification\docs\Specification.md
* The OGraf manifest file (called *.ograf.json) is defined by instructions\specification\json-schemas\graphics\schema.json
* The OGraf web-component interface is defined at instructions\typescript-definitions\src\apis\graphicsAPI.ts



Additional rules and guidelines for creating OGraf graphics:

* OGraf graphics should never paint any pixels before the first call to the playAction method.
* Graphics should have nice in- and out animations
* The schema definitions in the manifest file should use the GDD definitions as much as possible. The GDD definitions can be found at instructions\specification\json-schemas\gdd\README.md
