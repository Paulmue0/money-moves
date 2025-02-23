import pandas as pd

# CSV-Datei laden
csv_data = pd.read_csv('data/GDP by Country 1999-2022.csv')

# Extrahiere Ländernamen aus der Spalte "Country"
csv_countries = csv_data['Country'].unique()

# Speichere sie in einer Datei oder drucke sie aus
print(csv_countries)
