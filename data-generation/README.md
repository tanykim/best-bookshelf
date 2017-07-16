# Data Generation

Get your own Goodreads and the New York Times Books API keys first. Update ```keys.local``` with those keys, then create a json file. 

```
cp keys.local keys.json
```

## Step 1. Scrap NY Times Info

I manually added all best books of the New York Times since 1996.
Save the data in ```csv/nytimes-best-books.csv```

## Step 2. Get the book and author id from Goodreads

Run ```get-goodreads-ids.py```. The output will be saved in ```csv/goodreads-ids.csv```

Set start and end year as you accumulate dataset from Step 1.
The missing IDs MUST be included later manually for the folowing steps.

## Step 3. Get book info from Goodreads

Using ```book_id``` from the previous step, run ```get-book-info.py```. This generates ```book-info.csv```. 

Set start and end year as you accumulate datasets from Step 1. Some error cases are handled individually in the code.

## Step 4. Get author info from Goodreads

Using ```author_id``` from Step 2, run ```get-author-info.py```

Missing info such as gender, birth and death dates should be entered manually. 

First, this generates ```author-manual-info.csv```. Then run the script again, by changing a variable ```has_manual_info```. Second run generates ```author-info.csv```.

## Step 5. Get NT Times best seller info

Run ```get-best-seller-info.py```. The output wll be saved in ```csv/best-seller-info.json```

## Step 5. Save final JSON

Run ```get-final-json.py```. Incorporating the three csv files from the previous steps, this generates the final dataset for the front-end.