import urllib2
from StringIO import StringIO

def fetch_data(url):
    response = urllib2.urlopen(url)
    data = response.read()
    return data

def process_items(items):
    for i in xrange(len(items)):
        print items[i]

    results = {}
    for k, v in items.iteritems():
        results[k] = v * 2

    if results.has_key("total"):
        print "Total: %d" % results["total"]

    name = raw_input("Confirm? ")
    return results
