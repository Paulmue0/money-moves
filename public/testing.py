import json

# GeoJSON-Datei laden
with open('countries.geojson', 'r') as f:
    geojson = json.load(f)

# Extrahiere alle Ländernamen
geojson_countries = [feature['properties']['name'] for feature in geojson['features']]

# Speichere sie in einer Datei oder drucke sie aus
print(geojson_countries)
