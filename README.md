# Swanky Hippo

Setup the project by running 'npm install' in the root directory

If you are using Node version >= 8 you can
run 'src/server.js' with nodejs to start the application

Else run 'npm run build' followed by 'npm run serve'

Tests can be run by 'npm run test'

you can set a port for the server by setting a environt variable of name 'port' to the desired port
if no port is specified the server will start on port: 3000

You can watch the console for updates every time an exchange
sends back an update or you can visit localhost:{port}/ in your browser
to view a graphical representation of the results

API:
There is a simple api you can query for results returned in JSON

GET 'localhost:{port}/all':
     will return all of the price data for the tracked coins 

GET 'localhost:{port}/best':
    will return the best price for each pair and which exchange
    that price can be found at