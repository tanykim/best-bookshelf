import csv
import requests
import itertools
import json
from datetime import datetime

#API keys for two services constant
NYTIMES_API_KEY = ''
with open('keys.json', 'r', encoding='utf-8') as keys:
    keys = json.load(keys)
    NYTIMES_API_KEY= keys['nytimes_key']

def get_best_seller_info(isbn, author, title):
    base_url = 'http://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?api-key=' + NYTIMES_API_KEY
    if isbn != '':
        # print ('--seaerch by isbn')
        url = base_url + '&isbn=' + isbn
    else:
        # print ('--search by title and author')
        url = base_url + '&title=' + '+'.join(title.split(':')[0].split(' ')) + '&author=' + '+'.join(author.split(' '))
    print (url)
    json = requests.get(url).json()
    genre = ''
    results_count = json['num_results'] if 'num_results' in json else 0
    best_seller = {}
    if results_count == 1 and len(json['results']) > 0:
        print ('##### found')
        r = json['results'][0]['ranks_history']
        history = list(map(lambda x: dict(
            date=datetime.strptime(x['bestsellers_date'], '%Y-%m-%d').strftime('%b %d, %Y'),
            rank=x['rank'],
            list=x['display_name'],
            weeks=x['weeks_on_list']), r))
        for key, group in itertools.groupby(history, lambda x: x['list']):
            best_seller[key] = list(map(lambda x: dict(date=x['date'], rank=x['rank'], weeks=x['weeks']), list(group)))
            if 'Nonfiction' in key:
                genre = 'Nonfiction'
            elif 'Fiction' in key:
                genre = 'Fiction'
        print (None if best_seller == {} else best_seller )
    return dict(best_seller=best_seller, genre=genre)

#load data from the dataset collected manually
start_year = 2022
end_year = 2021
with open('csv/book-info.csv', newline='', encoding='latin-1') as f:
    data = {}
    for row in csv.DictReader(f):
        if int(row['year']) <= start_year and int(row['year']) >= end_year:
            print (row['year'], row['author_name'], row['book_title'])
            datum_base = row
            id = row['book_id']
            data[id] = get_best_seller_info(row['isbn'], row['author_name'], row['book_title'])
    #save as json
    json_data = json.dumps(data, ensure_ascii=True)
    print (json_data)

# with open('csv/best-seller-info.json', 'w', encoding='utf-8') as outfile:
#     json_data = json.dumps(data, ensure_ascii=True)
#     print (json_data)
#     outfile.write(json_data)