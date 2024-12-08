import pandas as pd
import os
import json
import re
from glob import glob

# Base directory where the data is stored
base_dir = "./Datasets"
output_file = "selected_fruits_data.json"

# List of specific fruits to process
selected_fruits = {
    "apples", "apricots", "bananas", "berries_mixed", "blackberries", "blueberries",
    "cantaloupe", "cherries", "cranberries", "dates", "figs",
    "grapefruit", "grapes", "honeydew", "kiwi", "mangoes", "nectarines", "oranges",
    "papaya", "peaches", "pears", "plums", "pomegranate", "raspberries",
    "strawberries", "watermelon"
}

# Initialize a structure to store all fruits
all_fruits = {}

# Loop through all folders
for year_folder in sorted(os.listdir(base_dir)):
    year_path = os.path.join(base_dir, year_folder)
    if os.path.isdir(year_path) and year_folder.lower().startswith("fruit-"):
        year = int(year_folder.split("-")[1])
        print(f"Processing data for year: {year}")  # Debug

        # Process only selected fruits
        for fruit in selected_fruits:
            # Match all variations: lowercase, capitalized, space, or underscore
            fruit_patterns = [
                os.path.join(year_path, f"{fruit}_*.*"),
                os.path.join(year_path, f"{fruit} *.*"),
                os.path.join(year_path, f"{fruit.capitalize()}_*.*"),
                os.path.join(year_path, f"{fruit.capitalize()} *.*")
            ]

            # Additional pattern for 2022 files with a dash
            if year == 2022:
                fruit_patterns.append(os.path.join(year_path, f"{fruit.capitalize()}-*.xlsx"))
                fruit_patterns.append(os.path.join(year_path, f"{fruit}-*.xlsx"))

            fruit_files = []
            for pattern in fruit_patterns:
                fruit_files.extend(glob(pattern))

            print(f"Looking for {fruit} in {year_folder}: Found {fruit_files}")  # Debug

            if not fruit_files:
                print(f"File for {fruit} not found in {year_folder}. Skipping {fruit}.")
                continue

            fruit_file = fruit_files[0]  # Get the first matching file
            try:
                # Read the Excel file without assuming headers
                df = pd.read_excel(fruit_file, header=None)
                print(f"Dataframe for {fruit_file}:\n", df.head())  # Debug

                # Find the row index where "Form" appears
                form_row = df[df[0].str.contains("Form", na=False)].index[0]
                relevant_data = df.iloc[form_row + 1:, [0, 1]].copy()  # Columns 0 and 1 are of interest

                # Normalize the "Form" column by removing numbers and extra text
                relevant_data[0] = relevant_data[0].astype(str).apply(lambda x: re.sub(r'[^a-zA-Z]', '', x).strip())

                # Extract rows with "Frozen" or "Fresh" only (exclude "Canned")
                forms = ["Frozen", "Fresh"]
                parsed_data = relevant_data[relevant_data[0].isin(forms)]  # Exact match only

                # Add parsed data to the main data structure
                for _, row in parsed_data.iterrows():
                    if fruit not in all_fruits:
                        all_fruits[fruit] = {}
                    if row[0] not in all_fruits[fruit]:
                        all_fruits[fruit][row[0]] = []
                    all_fruits[fruit][row[0]].append({"year": year, "price": row[1]})
            except Exception as e:
                print(f"Error processing {fruit_file}: {e}")
                continue

# Save the filtered data to JSON
with open(output_file, "w") as f:
    json.dump(all_fruits, f, indent=4)

print(f"Selected fruits data successfully saved to {output_file}")
