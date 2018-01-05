Advanced `redux-connect` routing example with SSR, Api endpoint, redirects, 404 error
===

To start application run:

````bash
yarn
yarn start
````

then open in browser [localhost:3000](http://localhost:3000)

Root route redirects to `/wrapped/second`, any subroute of `/wrapped/*` not matching `/wrapped/first` or `/wrapped/second` redirects to `/wrapped/first`.
Requests to non existing routes returns with 404 status code.