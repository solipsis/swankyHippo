# swankyHippo

Setup the project by running 'npm install' in the root directory
run 'server.js' with nodejs to start the application

the server will start on port: 3000

You can watch the console for updates every time an exchange
sends back an update or you can visit localhost:3000/ in your browser
to view a graphical representation of the results

API:
There is a simple api you can query for results returned in JSON

GET 'localhost:3000/all':
     will return all of the price data for the tracked coins 

GET 'localhost:3000/best':
    will return the best price for each pair and which exchange
    that price can be found at