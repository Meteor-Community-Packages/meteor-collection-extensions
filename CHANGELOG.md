# Changelog

This changelog has started with development of Version 1.0


## 1.0

### Functionality
- BREAKING!
- Meteor 3.0 compatibility for package and dependencies
- moved all code to at least ES6
- export `CollectionExtensions` as module, removed from global scope
- Extensions are not bound via `.apply`, since this would not
  work with arrow functions, the new extension format is passing the 
  collection as first argument!

### Tests
- dropped `ongoworks:security` from tests
- dropped `lai:document-methods` from tests
- dropped `cfs:*` from tests
- these dropped packages are currently out of reach for us;
  additionally, they are mostly deprecated, and we intend to
  include them in the future in case they get updated or transferred
- added/improved tests
