import csv
import json
from datetime import datetime

# save final result as json
def get_date(p_year, p_month, p_day):
    all_added = 'N/A'
    simple = 'N/A'
    if p_year != None and p_year != '':
        all_added = ('1' if p_month == None or p_month == '' else str(int(p_month))) + '/' + \
                           ('1' if p_day == None or p_day == '' else str(int(p_day))) + '/' + \
                           str(p_year)
        simple = str(p_year)[0:4] if p_day == None or p_day == '' else datetime.strptime(all_added, '%m/%d/%Y').strftime('%B %d, %Y')
    return [all_added, simple]

def get_age_at_publication(publication_date, original_publication_date, birth_date, death_date):
    age = 0
    #some erorr cases
    if (original_publication_date == '1/1/975'):
        original_publication_date = publication_date
    if birth_date != 'N/A':
        age = datetime.strptime(original_publication_date, '%m/%d/%Y') - datetime.strptime(birth_date, '%m/%d/%Y')
        age = age.days / 365.25
    if death_date != 'N/A':
        if (datetime.strptime(original_publication_date, '%m/%d/%Y') - datetime.strptime(death_date, '%m/%d/%Y')).days > 0:
            age = -10
    return age

def save_as_json(book_data, author_data, seller_data):
    books = []
    for row in book_data:
        publication_date = get_date(
            row['publication_year'],
            row['publication_month'],
            row['publication_day']
        )
        original_publication_date = get_date(
            row['original_publication_year'],
            row['original_publication_month'],
            row['original_publication_day']
        )
        author = author_data[row['author_id']]
        age_at_publication = get_age_at_publication(
            publication_date[0], original_publication_date[0],
            author['birth_date'], author['death_date']
        )
        author2 = {}
        if row['author2_id'] != '':
            author2 = author_data[row['author2_id']]
            age_at_publication2 = get_age_at_publication(
                publication_date[0], original_publication_date[0],
                author2['birth_date'], author2['death_date']
            )
            age_at_publication = (age_at_publication + age_at_publication2) / 2
        rating = int(row['ratings_sum']) / int(row['ratings_count'])
        #some error cases
        if row['book_id'] == '162950':
            row['num_pages'] = 256
        elif row['book_id'] == '205054':
            row['num_pages'] = 352
        elif row['book_id'] == '398586':
            row['num_pages'] = 887

        datum = dict(
            year_asc=int(row['year']),
            year_desc=int(row['year']) * -1,
            title=row['title'],
            title_asc=len(row['title']),
            title_desc=len(row['title']) * -1,
            genre= seller_data[row['book_id']]['genre'] if seller_data[row['book_id']]['genre'] != '' else row['genre'],
            gender=author['gender'],
            first_name=author['name'],
            last_name=author['name'].split(' ')[len(author['name'].split(' ')) - 1],
            age_asc=age_at_publication,
            age_desc=age_at_publication * -1,
            pages_asc=int(row['num_pages']),
            pages_desc=int(row['num_pages']) * -1,
            rating_asc=rating,
            rating_desc=rating * -1,
            rating_count_asc=int(row['ratings_count']),
            rating_count_desc=int(row['ratings_count']) * -1,
            is_bestseller=True if seller_data[row['book_id']]['best_seller'] != {} else False,
            is_not_bestseller=False if seller_data[row['book_id']]['best_seller'] != {} else True,
            is_english=True if row['translator'] == '' else False,
            book=dict(
                id=row['book_id'],
                translator=row['translator'],
                author_ids=[row['author_id'], row['author2_id']],
                author_names=author['name'] if author2 == {} else author['name'] + ' and ' + author2['name'],
                link=row['link'],
                editor=row['editor'],
                publisher=row['publisher'],
                publication_date=publication_date[1],
                original_publication_date=original_publication_date[1] if publication_date[0] != original_publication_date[0] else 'N/A',
                pages=int(row['num_pages']),
                rating=dict(
                    count=int(row['ratings_count']),
                    sum=int(row['ratings_sum'])
                ),
                image_url=row['image_url'],
                seller=seller_data[row['book_id']]['best_seller'],
                age_at_publication=age_at_publication
            )
        )
        books.append(datum)
    data = dict(books=books, authors=author_data, generation_date=datetime.now().strftime('%B %d, %Y'))
    file = open('../webapp/js/data.js', 'w', encoding='utf8')
    json_data = json.dumps(data, ensure_ascii=False)
    file.write('const data = ' + str(json_data) + ';')
    file.close()

book_data = []
with open('csv/book-info.csv', newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        book_data.append(row)

author_data = {}
with open('csv/author-info.csv', newline='', encoding='utf-8', errors='replace') as f:
    for row in csv.DictReader(f):
        id = row['author_id']
        author_data[id] = row
        birth_date = get_date(
            row['birth_year'],
            row['birth_month'],
            row['birth_day'],
        )
        death_date = get_date(
            row['death_year'],
            row['death_month'],
            row['death_day'],
        )
        author_data[id]['birth_date'] = birth_date[0]
        author_data[id]['death_date'] = death_date[0]
        author_data[id]['birth_date_simple'] = birth_date[1]
        author_data[id]['death_date_simple'] = death_date[1]

seller_data = {}
with open('csv/best-seller-info.json', 'r', encoding='utf-8') as f:
    seller_data = json.load(f)

save_as_json(book_data, author_data, seller_data)