#!/usr/bin/env python
import urllib2
import cPickle
from StringIO import StringIO

class Config:
    __metaclass__ = type
    DEBUG = True

def main():
    print "Starting application..."
    name = raw_input("Enter your name: ")
    print "Hello, " + name

    for i in xrange(10):
        print i

    data = {u"key": u"value", "count": long(42)}

    for k, v in data.iteritems():
        print "%s: %s" % (k, v)

    for v in data.itervalues():
        print v

    for k in data.iterkeys():
        print k

    if data.has_key("count"):
        print "Found count"

    try:
        exec "print 'dynamic'"
        result = 10 / 3
    except Exception, e:
        raise "Something went wrong"

if __name__ == "__main__":
    main()
