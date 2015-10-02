import http.server
import logging
import socketserver
import sqlite3 as lite
import urllib.parse
import argparse

logging.basicConfig(
    filename='log.txt',
    format='{asctime} | {ip} | Platform/Model - {platform}/{model} | {messageType}: {message}',
    style='{',
    level=20,
    datefmt='%Y-%m-%d %H:%M:%S'
)


class RequestHandler(http.server.BaseHTTPRequestHandler):
    def log_to_file(self, params):
        logging.info(
            params.get('message'),
            extra={
                'ip': self.address_string(),
                'platform': params.get('platform'),
                'model': params.get('model'),
                'messageType': params.get('messageType')
            }
        )


    def log_to_db(self, params):
        ip = self.address_string()

        params_as_tuple = (
            params['uuid'],
            ip,
            params['platform'],
            params['model'],
            params['latitude'],
            params['longitude'],
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


def parse_args():
    parser = argparse.ArgumentParser()

    parser.add_argument('--port', '-p', 
        type=int, 
        default=8001, 
        help='Port to run on; defaults to 8001')

    return parser.parse_args()


def main():
    args = parse_args()

    http_server = socketserver.TCPServer(("", args.port), RequestHandler)
    print("Running...")
    http_server.serve_forever()


if __name__ == '__main__':
    main()
