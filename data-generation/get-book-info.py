import csv
import goodreads
from datetime import datetime

def parse_html_page(link, publication_year, publication_month, publication_day, publisher, num_pages, image_url):
    soup = goodreads.get_html_page(link)
    info_tag = soup.find(itemprop='numberOfPages')
    if info_tag != None:
        num_pages = info_tag.contents[0].split(' ')[0]
        detail = info_tag.parent.next_sibling.next_sibling.contents[0]
        p_date = detail.split('Published')[1].split('by')[0].strip()
        p_arr = p_date.split(' ')
        if len(p_arr) == 3:
            publication_year = p_arr[2]
            publication_day = p_arr[1][:-2]
            publication_month = int(datetime.strptime(p_arr[0], '%B').strftime('%m'))
        elif len(p_arr) == 2:
            publication_year = p_arr[1]
            publication_month = int(datetime.strptime(p_arr[0], '%B').strftime('%m'))
        elif len(p_arr) == 1:
            publication_year = p_arr[0]
        publisher = detail.split('by')[1].strip() if len(detail.split('by')) > 1 else 'Unknown'
    image_tag = soup.find(id='coverImage')
    if image_tag != None:
        image_url = image_tag.get('src')
    book_info = dict(publication_year=publication_year,
            publication_month=publication_month,
            publication_day=publication_day,
            publisher=publisher,
            num_pages=num_pages,
            image_url=image_url)
    return book_info

#get book & autho info
def get_book_info(book_id, genre):
    book_obj = goodreads.get_object('book', book_id)
    book_info = dict(book_id=book_id)
    dict_fields = ['title', 'image_url', 'publisher',
                     'num_pages', 'link', 'isbn', 'isbn13',
                     'publication_year', 'publication_month', 'publication_day']
    #check if missing information
    hasEmpty = False
    for field in dict_fields:
        if book_obj[field] == None:
            hasEmpty = True
        book_info[field] = book_obj[field]
    work = book_obj['work']
    #check if the work is same as the books
    if work['best_book_id']['#text'] == book_id:
        work_dict_fields = ['ratings_sum', 'ratings_count',
                              'original_publication_year', 'original_publication_month', 'original_publication_day']
        for field in work_dict_fields:
            if '#text' in work[field]:
                book_info[field] = work[field]['#text']
    # if hasEmpty and book_info['link'] != '' or 'nophoto/book/111' in book_info['image_url']:
        # update in 2019 -- not working anymore, manually check missing information
        # parse missing data from html page
        # data = parse_html_page(book_info['link'],
        #         book_info['publication_year'],
        #         book_info['publication_month'],
        #         book_info['publication_day'],
        #         book_info['publisher'],
        #         book_info['num_pages'],
        #         book_info['image_url']
        #     )
        # book_info.update(data)
    #no genre info
    if genre == '':
        shelves = list(map(lambda x: x['@name'], book_obj['popular_shelves']['shelf']))
        if ('non-fiction' in shelves) and ('fiction' in shelves):
            book_info['genre'] = 'Nonfiction' if shelves.index('non-fiction') < shelves.index('fiction') else 'Fiction'
        elif ('nonfiction' in shelves) or ('non-fiction' in shelves):
            book_info['genre'] = 'Nonfiction'
        elif ('novels' in shelves) or ('fiction' in shelves):
            book_info['genre'] = 'Fiction'

    return book_info

#load data from the dataset collected manually
start_year = 2022
end_year = 2021
with open('csv/goodreads-ids.csv', newline='', encoding='latin-1') as f:
    data = []
    for row in csv.DictReader(f):
        print (row['year'], row['book_title'], row['book_id'])
        if int(row['year']) <= start_year and int(row['year']) >= end_year:
            print ('--get book info')
            datum_base = row
            datum = get_book_info(row['book_id'], row['genre'])
            datum_base.update(datum)
            data.append(datum_base)
    print (data)
    goodreads.save_as_csv('book-info', data)