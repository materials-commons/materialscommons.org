#!/usr/bin/env python
import time
import sys

import stomp

class MyListener(object):
    def on_error(self, headers, message):
        print 'received an error %s' % message

    def on_message(self, headers, message):
        print 'received a message %s' % message

conn = stomp.Connection()
conn.set_listener('', MyListener())
conn.start()
conn.connect()

conn.subscribe(destination='/topic/00c9b6ad-a266-4cbe-beed-c2b221bbc102', ack='auto')

#conn.send(' '.join(sys.argv[1:]), destination='/queue/00c9b6ad-a266-4cbe-beed-c2b221bbc102')

time.sleep(2000000)
conn.disconnect()
