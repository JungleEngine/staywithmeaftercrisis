echo 'Testing if the server works'
nodejs main.js &
srvr=$!
sleep 1
resp=$(curl -s localhost:8080)

if [ "$resp" = "Hello World" ]; then
	echo "\e[32mServer Responded Successfully!"
	echo "response: $resp"
	if [ srvr ]; then
		kill -9 $srvr 2>/dev/null
	fi
	exit 0
else
	echo "\e[31Server did not respond with the expected."
	echo "response:$resp"
	exit 2
fi