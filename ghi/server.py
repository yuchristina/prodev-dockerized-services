from http.server import SimpleHTTPRequestHandler, HTTPServer
from string import Template
from urllib.parse import urlparse
import os

hostName = "0.0.0.0"
serverPort = 80 if "PORT" not in os.environ else int(os.environ["PORT"])

class MyServer(SimpleHTTPRequestHandler):
  def do_GET(self):
    url = urlparse(self.path)
    if url.path.endswith(".css") or url.path.endswith(".js") or url.path.endswith(".png"):
      super().do_GET()
    else:
      if 'APP_URL' not in os.environ:
        os.environ['APP_URL'] = 'error://not_found'
      if 'AUTH_URL' not in os.environ:
        os.environ['AUTH_URL'] = 'error://not_found'
      with open("index.html", "r") as file:
        template = Template(file.read())
      self.send_response(200)
      self.send_header("Content-type", "text/html")
      self.end_headers()
      self.wfile.write(bytes(template.safe_substitute(os.environ), "utf-8"))

if __name__ == "__main__":
  webServer = HTTPServer((hostName, serverPort), MyServer)
  print("Server started http://%s:%s" % (hostName, serverPort))

  try:
    webServer.serve_forever()
  except KeyboardInterrupt:
    pass

  webServer.server_close()
  print("Server stopped.")
