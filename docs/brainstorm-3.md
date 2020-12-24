```javascript
// row rendrerer (file 1)

{
    renderName() {
        // does NOT depend on anything else
    },
    renderPercentageComplete() {},
}

// subtask renderer (file 2)

{   
    renderName() {
        // does NOT depend on rowRenderer
    },
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

const R = renderer({rootHtmlElem: ___, showSubtasks: true}) // is an object with rendrName(), ren

R.renderName // is same as 

function () {
    SubtaskRenderer.rederName()
    RowRenderer.renderName()
}

```

layerCompose(
    (services) => {
        services.serviceA
        
        return {
            add() {
             // uses service A & B together
            }
        }
    }, 

    {   
        serviceA: [l1, l2, l3],
        serviceB: [la, lb]
    }
)
