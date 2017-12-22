import csv
import requests
import xmltodict
from json import loads, dumps
import urllib.request
from bs4 import BeautifulSoup
import json

#API keys
GOODREADS_API_KEY = ''
with open('keys.json', 'r', encoding='utf-8') as keys:
    keys = json.load(keys)
    GOODREADS_API_KEY= keys['goodreads_key']


#convert ordered dict to normal dict
def to_dict(input_ordered_dict):
    return loads(dumps(input_ordered_dict))

#save intermediate results as csv - append rows
def save_as_csv(filename, data):
    has_data = False
    with open('csv/' + filename + '.csv', 'r', encoding='latin-1') as f:
        reader = csv.reader(f)
        #if already saved
        for row in reader:
            has_data = True
            break
    with open('csv/' + filename + '.csv', 'a', encoding='utf-8') as f:
        writer = csv.writer(f)
        if has_data is False:
            writer.writerow(data[0].keys())
        for datum in data:
            writer.writerow(datum.values())

#search ids
def get_search_obj(author, title):
    xml = requests.get(url='https://www.goodreads.com/search/index.xml?key=' + GOODREADS_API_KEY + '&q=' + author + ' ' + title.replace('"', ''))
    obj = to_dict(xmltodict.parse(xml.content))
    return obj

#get book or author object
def get_object(type, id):
    url = 'https://www.goodreads.com/' + type +'/show/'
    xml = requests.get(url=url + id + '.xml?key=' + GOODREADS_API_KEY)
    obj = to_dict(xmltodict.parse(xml.content))
    return obj['GoodreadsResponse'][type]

def get_html_page(link):
    response = urllib.request.urlopen(link)
    return BeautifulSoup(response.read(), 'html.parser')
