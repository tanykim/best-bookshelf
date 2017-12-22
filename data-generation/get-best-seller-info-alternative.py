import itertools
import json
from datetime import datetime

####
# This file is only for when NYTimes API is fucked up, saying invalid authorization
####

def get_best_seller_info(t):
    genre = ''
    best_seller = {}
    r = t['ranks_history']
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
    return dict(best_seller=best_seller, genre=genre)


# manually get the data from Chrom URL, and copy the matching result element
t = {"title":"GRANT","description":"A biography of the Union general of the Civil War and two-term president of the United States.","contributor":"by Ron Chernow","author":"Ron Chernow","contributor_note":"","price":0,"age_group":"","publisher":"Penguin Press","isbns":[{"isbn10":"159420487X","isbn13":"9781594204876"},{"isbn10":"052552195X","isbn13":"9780525521952"}],"ranks_history":[{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":3,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-12-31","bestsellers_date":"2017-12-16","weeks_on_list":10,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":4,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-12-31","bestsellers_date":"2017-12-16","weeks_on_list":10,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":2,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-12-24","bestsellers_date":"2017-12-09","weeks_on_list":9,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":2,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-12-24","bestsellers_date":"2017-12-09","weeks_on_list":9,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":3,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-12-17","bestsellers_date":"2017-12-02","weeks_on_list":8,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":2,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-12-17","bestsellers_date":"2017-12-02","weeks_on_list":8,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":4,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-12-10","bestsellers_date":"2017-11-25","weeks_on_list":7,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":6,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-12-10","bestsellers_date":"2017-11-25","weeks_on_list":7,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":6,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-12-03","bestsellers_date":"2017-11-18","weeks_on_list":6,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":7,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-12-03","bestsellers_date":"2017-11-18","weeks_on_list":6,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":4,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-11-26","bestsellers_date":"2017-11-11","weeks_on_list":5,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":5,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-11-26","bestsellers_date":"2017-11-11","weeks_on_list":5,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":5,"list_name":"Hardcover Nonfiction","display_name":"Hardcover Nonfiction","published_date":"2017-11-19","bestsellers_date":"2017-11-04","weeks_on_list":4,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":5,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-11-19","bestsellers_date":"2017-11-04","weeks_on_list":4,"ranks_last_week":0,"asterisk":0,"dagger":0},{"primary_isbn10":"159420487X","primary_isbn13":"9781594204876","rank":5,"list_name":"Combined Print and E-Book Nonfiction","display_name":"Combined Print & E-Book Nonfiction","published_date":"2017-11-12","bestsellers_date":"2017-10-28","weeks_on_list":3,"ranks_last_week":0,"asterisk":0,"dagger":0}],"reviews":[{"book_review_link":"https://www.nytimes.com/2017/10/12/books/review/ron-chernow-ulysses-s-grant-biography-bill-clinton.html","first_chapter_link":"","sunday_review_link":"","article_chapter_link":""}]};
data = get_best_seller_info(t)
json_data = json.dumps(data, ensure_ascii=True)
print (json_data)
