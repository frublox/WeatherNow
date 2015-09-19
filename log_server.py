import http.server
import logging
import socketserver
import sqlite3 as lite
import urllib.parse

logging.basicConfig(
	filename='log.txt',
	format='{asctime} | {ip} | {platform} - {model} | {messageType}: {message}',
	style='{',
	level=20,
	datefmt='%Y-%m-%d %H:%M:%S'
)


class RequestHandler(http.server.BaseHTTPRequestHandler):
	def log_to_file(self, params):
		logging.info(
			params['message'],
			extra={
				'ip': self.address_string(),
				'platform': params['platform'],
				'model': params['model'],
				'messageType': params['messageType']
			}
		)


	def log_to_db(self, params):
		ip = self.address_string()

		parsed_coords = map(int, params['coords'].replace(' ', '').split(','))

		latitude = parsed_coords[0]
		longitude = parsed_coords[1]

		params_as_tuple = (
			params['uuid'],
			ip,
			params['platform'],
			params['model'],
			latitude,
			longitude,
			params['messageType'],
			params['message']
		)

		db = lite.connect('test.db')

		with db:
			db.execute(
				"INSERT INTO Messages VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
				params_as_tuple
			)


	def do_GET(self):
		params = urllib.parse.parse_qs(self.path[2:])
		
		# parse_qs puts the results into lists, so we have to unlistify them
		for key, value in params.items():
			params[key] = value[0]
		
		print(params)

		self.log_to_file(params)
		# self.log_to_db(params)

		self.send_response(200)



def main():
	http_server = socketserver.TCPServer(("", 80), RequestHandler)
	print("Running...")
	http_server.serve_forever()


if __name__ == '__main__':
	main()
