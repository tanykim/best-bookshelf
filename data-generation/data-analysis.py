import csv
import itertools

import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats
import matplotlib as mpl
import matplotlib.pyplot as plt
import math
from datetime import datetime

data = pd.read_csv('csv/book-info.csv', encoding="latin-1")
author_data = pd.read_csv('csv/author-info.csv', encoding="latin-1")
ages = []
genders = []
for id in zip(list(data['author_id']), list(data['book_id'])):
    a = id[0]
    b = id[1]

    a_match = author_data.loc[author_data['author_id'] == a]
    b_match = data.loc[data['book_id'] == b]
    birth_date = list(a_match['born_at'])[0]
    p_year = list(b_match['publication_year'])[0]
    p_month = list(b_match['publication_month'])[0]
    p_day = list(b_match['publication_day'])[0]
    publication_date = ('1' if math.isnan(p_month) else str(int(p_month))) + '/' + \
                       ('1' if math.isnan(p_day) else str(int(p_day))) + '/' + \
                        str(p_year)
    if birth_date[4:] == '--':
        birth_date = '1/1/' + birth_date[0:4]
    age = None
    if birth_date != 'unknown':
        print (publication_date, birth_date)
        age = datetime.strptime(publication_date, '%m/%d/%Y') - \
            datetime.strptime(birth_date, '%m/%d/%Y')
        age = age.days/365.25
    ages.append(age)
    genders.append(list(a_match['gender'])[0])
data['author_age'] = ages
data['author_gender'] = genders
print (data)

# g = sns.FacetGrid(data, col="genre", row="year", hue="author_gender", size=2)
# g.map(plt.scatter, "num_pages", "author_age", alpha=.7)
# sns.plt.show()

# colors = {'female':'red', 'male':'blue'}
# data['size'] = size
# fig, ax = plt.subplots()
# grouped = data.groupby('author_gender')
# for key, group in grouped:
#     group.plot(ax=ax,
#                kind='scatter',
#                x='num_pages',
#                y='author_age',
#                label=key,
#                color=colors[key])
# fig.suptitle('Best Books by the New York Times (2006-2016)', fontsize=14)
# plt.show()
# fig.savefig('test.jpg')

# ax = plt.subplots()
# x = list(data['author_age'])
# y = list(data['num_pages'])
# size = list(map(lambda x: int(x[1]) / int(x[0]) * 10, zip(list(data['ratings_count']), list(data['ratings_sum']))))
# colors = list(data['author_gender'])
# plt.scatter(x, y, s=size, alpha=0.5)
# plt.show()

import matplotlib.patches as mpatches
import math
fig, ax = plt.subplots()
size = list(map(lambda x: math.sqrt(int(x[1])) * 0.8, zip(list(data['ratings_count']), list(data['ratings_sum']))))
colors = dict(female='red', male='blue', Fiction='green', Nonfiction='purple')
plt.scatter(data['author_age'], data['num_pages'],
            c=data['genre'].apply(lambda x: colors[x]),
            s=size, alpha=0.5)
fig.suptitle('Best Books by the New York Times (2006-2016) \n (size = ratings count)', fontsize=14)
plt.xlabel('Age of Author at Publication (years old)')
plt.ylabel('Number of Pages')
red_patch = mpatches.Patch(color='green', label='Fiction')
blue_patch = mpatches.Patch(color='purple', label='Nonfiction')
plt.legend(handles=[red_patch, blue_patch])
plt.show()

# ax = sns.stripplot(x='num_pages', y='author_age', data=data)
# sns.plt.show()