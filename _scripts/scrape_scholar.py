import requests
from bs4 import BeautifulSoup
import time

# Replace with your Google Scholar profile URL
url = "https://scholar.google.com/citations?hl=en&user=RWGt9XQAAAAJ"

# Send an HTTP GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    page_number = 1
    while True:
        # Parse the HTML content of the page
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the section containing publication entries
        publications = soup.find_all("tr", {"class": "gsc_a_tr"})

        # Iterate through each publication
        for pub in publications:
            title = pub.find("a", {"class": "gsc_a_at"}).text
            authors = pub.find("div", {"class": "gs_gray"}).text
            citation = pub.find("a", {"class": "gsc_a_ac"}).text

            # Print publication information (you can save it to a file or database)
            print("Title:", title)
            print("Authors:", authors)
            print("Citation:", citation)
            print("\n")

        # Find the "Next" button to go to the next page
        next_button = soup.find("button", {"aria-label": "Next"})

        if next_button:
            # Send a request to the next page
            page_number += 1
            response = requests.get(url + f"&start={page_number * 10 - 10}")
        else:
            # No more pages, break out of the loop
            break

        # Add a delay to avoid making too many requests too quickly
        time.sleep(20)  # Sleep for 2 seconds between requests (adjust as needed)
else:
    print("Failed to retrieve data from Google Scholar. Status code:", response.status_code)
