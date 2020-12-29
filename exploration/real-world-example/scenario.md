Scenario:

Task is an object with:
id, name, start & end dates, subtaskIds

The same task is shown on the page in 2 spots
a row view and an expanded view

So we reuse the data between the views
We also manage the views, eg: expanded view might be closed or opened

To make the matters even more complex, each view is modifiable
In row view, columns can be shown or removed
In expanded view certain elements can also be shown or removed

To put a cherry on top, we reuse the row renderer within the expanded view
to render subtasks

