import pandas as pd

# Daten einlesen
gdp_data = pd.read_csv("dataset_gdp_feb_2025.csv")
unemployment_data = pd.read_csv("unemployment_data.csv")
emission_data = pd.read_csv("emission_data.csv")

# GDP umformen
gdp_data = gdp_data.melt(id_vars=["Country"], var_name="Year", value_name="GDP")

# Unemployment-Daten umformen
unemployment_data = unemployment_data.melt(id_vars=["Country Name", "Country Code"], var_name="Year", value_name="UnemploymentRate")

# Nur numerische Jahre behalten
unemployment_data = unemployment_data[unemployment_data["Year"].str.isnumeric()]

# Emissionsdaten bereinigen
emission_data = emission_data.rename(columns={"Country": "Country Name", "Year": "Year", "Total": "Emission"})

# Stelle sicher, dass alle Year-Spalten denselben Typ haben
gdp_data["Year"] = gdp_data["Year"].astype(int)
unemployment_data["Year"] = unemployment_data["Year"].astype(int)
emission_data["Year"] = emission_data["Year"].astype(int)

# Zusammenführen
merged_data = pd.merge(gdp_data, unemployment_data, left_on=["Country", "Year"], right_on=["Country Name", "Year"], how="left")
merged_data = pd.merge(merged_data, emission_data, on=["Country Name", "Year"], how="left")

# Ergebnis speichern
merged_data = merged_data[["Country", "Year", "GDP", "UnemploymentRate", "Emission"]]
merged_data.to_csv("combined_data_2.csv", index=False, sep=';')
