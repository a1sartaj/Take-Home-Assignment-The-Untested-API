### Bug: Invalid pagination parameters are not validated

**Location:**  
GET /tasks endpoint (routes/tasks.js)

**Expected Behavior:**  
When invalid values are passed for `page` or `limit` (e.g., strings like "abc"), the API should return a 400 Bad Request error.

**Actual Behavior:**  
The API accepts invalid values and returns a 200 OK response with task data.

**How I found it:**  
While writing integration tests for pagination, I passed non-numeric values (`page=abc&limit=xyz`) and observed that the API still returned success.

**Reason:**  
There is no validation for query parameters `page` and `limit` before processing them.

**Impact:**  
This can lead to unexpected results and incorrect pagination behavior.

**Fixing:**  
I have added a condition in get tasks route if `page` and `limit` is not number it return a 400 error.