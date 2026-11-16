# Maps

Views of the project generated from its own source, committed, and checked by
`tests/test_maps.py` (fails when a committed map differs from what its generator
produces now). Never edit a map by hand.

| Map | Read it to answer | Kind |
|---|---|---|
| `inventory.md` | Does this component, helper, cue table or tool already exist? Which files are large? | informing |

Loop for every change: read the map → change the code → run
`python -m unittest discover -s tests` (compare mode) and read the diff →
`python tools/maps/update_maps.py` → commit the map with the change and say in the
commit message what it showed.

No blocking map yet: the project has no persisted data or public API that people
outside it depend on. A rules index will start with the first behaviour test.
