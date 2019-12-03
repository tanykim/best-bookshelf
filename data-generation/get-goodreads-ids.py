import csv

import goodreads


# find the best matching book from work array
def find_best_match(works, author_in_query, book_in_query, result):
    for work in works:
        author_name = work["best_book"]["author"]["name"].lower()
        book_title = work["best_book"]["title"].lower()
        print(author_name, book_title)
        if book_title.split(" ")[0] != "summary" and (
            author_name == author_in_query.lower()
            or book_in_query.split(":")[0].lower() == book_title
        ):
            print("---find match")
            result = work["best_book"]
            break
    return result


# search book
def search_by_author_and_book(title, author):
    obj = goodreads.get_search_obj(author, title)
    search_count = int(obj["GoodreadsResponse"]["search"]["total-results"])

    # get the matching book in the results
    r = "__N/A__"
    book_id = ""
    author_id = ""
    if search_count > 0:
        if search_count == 1:
            r = obj["GoodreadsResponse"]["search"]["results"]["work"]["best_book"]
        else:
            r = find_best_match(
                obj["GoodreadsResponse"]["search"]["results"]["work"], author, title, r
            )
    if r != "__N/A__":
        book_id = r["id"]["#text"]
        author_id = r["author"]["id"]["#text"]
    else:
        print("----- no matching author or title id", author, title)
    return dict(book_id=book_id, author_id=author_id)


# load data from the dataset collected manually
start_year = 2019
end_year = 2019
with open("csv/nytimes-best-books.csv", newline="", encoding="latin-1") as f:
    data = []
    for row in csv.DictReader(f):
        print(row["year"], row["author_name"], row["book_title"])
        if int(row["year"]) <= start_year and int(row["year"]) >= end_year:
            datum_base = row
            datum = search_by_author_and_book(row["book_title"], row["author_name"])
            datum_base.update(datum)
            data.append(datum_base)
    goodreads.save_as_csv("goodreads-ids", data)
