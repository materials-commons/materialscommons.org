#!/usr/bin/env python
import asyncore
from smtpd import SMTPServer

class MCEmailServer(SMTPServer):
    def process_message(self, peer, mailfrom, rcpttos, data):
        print mailfrom
        print rcpttos
        print data

def run():
    MCEmailServer(('localhost', 25001), None)
    try:
        asyncore.loop()
    except:
        pass

if __name__ == '__main__':
    run()
