import csv
import goodreads
import requests
from datetime import datetime
import re

has_manual_data = True

#load manually updated birth, death dates
author_manual = {}
with open('csv/author-manual-info.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        author_manual[row['author_id']]= row

def parse_html_page(link, born_at):
    soup = goodreads.get_html_page(link)
    birth_date = soup.find(itemprop='birthDate')
    if birth_date:
        bd = birth_date.string.split(' ').strip()
        born_at = datetime.strptime(bd, '%B %d %Y').strftime('%Y/%m/%d')
        print ('===========from Goodreads page', born_at)
    return born_at

def search_wiki(name):
    url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + name
    json = requests.get(url).json()
    str = json['query']['search'][0]['snippet']
    bd = re.compile("\((.*[1-2][0-9]{3})\)")
    match = bd.search(str)
    if match:
        print(json['query']['search'][0]['title'], name, match.group(0), str)

#once the gender dates are manually compelted, then update the autho info with other fields
def update_author_info(author_id):
    author_obj = goodreads.get_object('author', author_id)
    author_info = dict(author_id=author_id)
    dict_fields = ['name', 'image_url', 'link']
    for field in dict_fields:
        author_info[field] = author_obj[field]
    #COMMENT this for the first run, updated with manually added birth and death dates
    update_fields = ['gender', 'birth_year', 'birth_month', 'birth_day', 'death_year', 'death_month', 'death_day']
    for field in update_fields:
        author_info[field] = author_manual[author_id][field]
    return author_info

#get author gender and birth and death dates
def get_author_info(author_id):
    author_obj = goodreads.get_object('author', author_id)
    author_info = dict(author_id=author_id)
    dict_fields = ['gender', 'born_at', 'died_at']
    for field in dict_fields:
        author_info[field] = author_obj[field]

    #often there's multiple spaces between first and last name
    author_info['name'] = re.sub( '\s+', ' ', author_info['name']).strip();
    author_info['birth_year'] = None
    author_info['birth_month'] = None
    author_info['birth_day'] = None
    author_info['death_year'] = None
    author_info['death_month'] = None
    author_info['death_day'] = None

    # Update birth info from the web pages
    if author_obj['born_at'] == None:
        author_info['born_at'] = parse_html_page(author_info['link'], author_info['born_at'])
    #show possible birth date from Wikipedia
    if author_obj['born_at'] == None:
        search_wiki(author_info['name'])

    if author_info['born_at'] is not None:
        bd = author_info['born_at']
        author_info['birth_year'] = datetime.strptime(bd, '%Y/%m/%d').strftime('%Y')
        author_info['birth_month'] = datetime.strptime(bd, '%Y/%m/%d').strftime('%m')
        author_info['birth_day'] = datetime.strptime(bd, '%Y/%m/%d').strftime('%d')
    if author_info['died_at'] is not None:
        dd = author_info['died_at']
        author_info['death_year'] = datetime.strptime(dd, '%Y/%m/%d').strftime('%Y')
        author_info['death_month'] = datetime.strptime(dd, '%Y/%m/%d').strftime('%m')
        author_info['death_day'] = datetime.strptime(dd, '%Y/%m/%d').strftime('%d')

    return author_info

# get author ids
author_ids = []
with open('csv/goodreads-ids.csv', newline='', encoding='latin-1') as f:
    for row in csv.DictReader(f):
        if not row['author_id'] in author_ids:
            author_ids.append(row['author_id'])
        if row['author2_id'] != '' and not row['author2_id'] in author_ids:
            author_ids.append(row['author2_id'])
# check author_ids parsed ids
already_parsed = []
with open('csv/author-info.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        already_parsed.append(row['author_id'])

# get newly added author info
data = []
for id in author_ids:
    if not id in already_parsed:
        print ('--get author info', id)
        if has_manual_data:
            datum = update_author_info(id)
        else:
            datum = get_author_info(id)
        data.append(datum)

goodreads.save_as_csv('author-info', data)