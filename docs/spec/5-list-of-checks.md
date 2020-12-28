A note on performance: performance is paramount to `layerCompose`.  
Thus, majority if not all checks should be dropped in production mode.

**Warning**  
Make sure to check other spec files for checks that might be omitted in this file.  
This is work in progress.

```javascript
const data = {key: 'value'}

const Wrapper = layerCompose(...)

```
