#!/usr/bin/python
# -*- coding: UTF8 -*-
# @See http://www.python.org/dev/peps/pep-0263/

#######
# ABOUT
#######

# Covid-19 actions stringency and cases data from OWID

########
# AUTHOR
########

# Teemo Tebest (teemo.tebest@gmail.com)

#########
# LICENSE
#########

# CC-BY-SA 4.0 EBU / Teemo Tebest

#######
# USAGE
#######

# python 2021-covid19vaccines.py

# Load the Pandas libraries with alias pd.
import pandas as pd

# Import request for adding headers to our request.
from urllib.request import Request, urlopen

# Import numpy to check for zeros.
import numpy as np

# Read the file and filter columns.
# https://stackoverflow.com/questions/62278538/pd-read-csv-produces-httperror-http-error-403-forbidden/62278737#62278737
url ='https://covid.ourworldindata.org/data/owid-covid-data.csv'
req = Request(url)
req.add_header('User-Agent', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0')
content = urlopen(req)
df = pd.read_csv(content, usecols=['continent','location','date','people_fully_vaccinated_per_hundred','new_cases_smoothed'])

# Filter data by row values.
df = df[df['continent'] == 'Europe']

# Convert NaN to None
# https://stackoverflow.com/questions/28639953/python-json-encoder-convert-nans-to-null-instead/34467382#34467382
df = df.where(pd.notnull(df), 0)

# Loop throught the all European countries and create data.
data = []
df = df[df['date'] > '2020-02-24']
# https://chrisalbon.com/python/data_wrangling/pandas_list_unique_values_in_column/
for country in df.location.unique():
  country_data_name = country
  # Change Vatican to Holy See because that corresponds with the map data.
  if country == 'Vatican':
    country_data_name = 'Holy See';
  # Skip administrative areas as they are not countries.
  if country == 'Vatican' or  country == 'Isle of Man' or country == 'Faeroe Islands' or country == 'Guernsey' or country == 'Jersey' or country == 'Gibraltar':
    continue
  previous_value_new_cases_smoothed = 0
  previous_value_people_fully_vaccinated_per_hundred = 0
  data_tmp = {'country':country_data_name, 'date':[], 'new_cases_smoothed':[], 'people_fully_vaccinated_per_hundred':[]}
  for index, values in (df[df['location'] == country]).iterrows():
    # If the value is not zero, fill the data.
    data_tmp['date'].append(values.date)
    if values.new_cases_smoothed != 0:
      previous_value_new_cases_smoothed = values.new_cases_smoothed
      data_tmp['new_cases_smoothed'].append(values.new_cases_smoothed)
    # If the value is zero, fill the data with the previous value.
    else:
      data_tmp['new_cases_smoothed'].append(previous_value_new_cases_smoothed)
    if values.people_fully_vaccinated_per_hundred != 0:
      previous_value_people_fully_vaccinated_per_hundred = values.people_fully_vaccinated_per_hundred
      data_tmp['people_fully_vaccinated_per_hundred'].append(values.people_fully_vaccinated_per_hundred)
    # If the value is zero, fill the data with the previous value.
    else:
      data_tmp['people_fully_vaccinated_per_hundred'].append(previous_value_people_fully_vaccinated_per_hundred)
  data.append(data_tmp)

# Export data.
import json
data = {'data':data}
with open('../media/data/data.json', 'w') as outfile:
  json.dump(data, outfile)

print ('All done!\n')