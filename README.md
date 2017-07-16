# best-bookshelf

This proejct is data bisualization of the New York Times Best Books from 1996 to 2016.

The live demonstration is [here.](http://tany.kim/best-bookshelf)

## Data Generation

I begin with scrapping NYTimes articles on best books at the end of each year. The python scripts allow you to generate a dataset, including book and author information from Goodreads, and best seller information using NYTimes books API.

## Webapp

The actual visualization work, developed with HTML, CSS, and Javascript. No serious framework or data bindings, except D3 and Lodash.