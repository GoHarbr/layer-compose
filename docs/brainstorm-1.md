```javascript
// row rendrerer (file 1)

{
    renderName() {},
    renderPercentageComplete() {},
}

// subtask renderer (file 2)

{   
    renderSubtasks(),
}
```

```javascript
// file 3

import rowRenderer from ...
import subtaskRendrere from

export default layerCompose(file1, file2) 
layerCompose(rowRenderer, subtaskRenderer)

(data: any) => {
    renderName
    renderPercentageComplete
    renderSubtasks
}    

```

```javascript
// file 4

import rendere from file3

renderer({rootHtmlElem: ___}) // is an object with rendrName(), ren

```
