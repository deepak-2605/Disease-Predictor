import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS from flask_cors
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Your training data, model creation, and classifier code should be here
training_data = pd.read_csv('./datasets/Training.csv')
testing_data = pd.read_csv('./datasets/Testing.csv')
training_data = training_data[training_data.columns[:-1]]
all_symptoms = training_data.columns
final_symptoms  = []
for i in all_symptoms:
    final_symptoms.append(i.replace('_', ' '))
training_data.columns = final_symptoms
testing_data.columns = final_symptoms
final_symptoms = final_symptoms[:-1]
output_file = open('all_symptoms.txt', 'w')

for symptom in final_symptoms:
    output_file.write('"' + symptom + '", ')

output_file.close()


# Split the dataset into features (X) and target (y)
X_train = training_data.iloc[:, :132]  # Features
y_train = training_data.iloc[:, -1]   # Target
X_test = testing_data.iloc[:, :132]  # Features
y_test = testing_data.iloc[:, -1]   # Target

# Create and train the Naive Bayes classifier
naive_bayes_classifier = MultinomialNB()
naive_bayes_classifier.fit(X_train, y_train)

# Create and train the Decision Tree classifier
decision_tree_classifier = DecisionTreeClassifier(random_state=42)
decision_tree_classifier.fit(X_train, y_train)

# Create and train the Random Forest classifier
random_forest_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
random_forest_classifier.fit(X_train, y_train)

# Define endpoint for disease prediction
@app.route('/predict_disease', methods=['POST'])
def predict_disease():
    data = request.json  # Get JSON data from frontend
    symptoms = data.get('symptoms', [])  # Get symptoms array from JSON
    
    user_input = [0] * 132  # Initialize user input array with zeros
    
    # Map symptoms fetched from JavaScript to indices in the user_input array
    for sym in symptoms:
        if sym in final_symptoms:
            ind = final_symptoms.index(sym)
            user_input[ind] = 1
    
    user_input = np.array(user_input).reshape(1, -1)
    
    # Use the trained classifiers to predict diseases
    disease_nb = naive_bayes_classifier.predict(user_input)
    disease_dt = decision_tree_classifier.predict(user_input)
    disease_rf = random_forest_classifier.predict(user_input)
    diseases = [disease_nb[0], disease_dt[0], disease_rf[0]]


    # dictionary to keep count of each value
    counts = {}
    # iterate through the list
    for item in diseases:
        if item in counts:
            counts[item] += 1
        else:
            counts[item] = 1
    # get the keys with the max counts
    disease = [key for key in counts.keys() if counts[key] == max(counts.values())]
    response = {
        'disease': disease[0]
    }
        
    return jsonify(response)  # Send the response back to the frontend




@app.route('/disease_description', methods=['POST'])
def disease_description():
    data2 = request.json  # Get JSON data from frontend
    disease = data2.get('disease')  # Get symptoms array from JSON
    
    content_html = ""
    search_url = f'https://www.diseaseinfosearch.org/search?term={disease}'
    response = requests.get(search_url, verify=False)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the element with the specified class
    link_element = soup.find(class_='secondary-link double-arrow-right')

    if link_element:
        # Extract the URL from the 'href' attribute
        extracted_link = link_element.get('href')

        # Step 2: Use the extracted link to fetch the content
        full_url = f'https://www.diseaseinfosearch.org{extracted_link}'
        content_response = requests.get(full_url, verify=False)
        content_soup = BeautifulSoup(content_response.content, 'html.parser')

        # Find all elements with the class 'content' and select the second one
        content_elements = content_soup.find_all(class_='content')

        # Ensure there are at least two 'content' class elements found
        if len(content_elements) >= 2:
            # Extract the second 'content' class element
            second_content_element = content_elements[1]

            # Extract inner HTML content of the second 'content' class element
            content_html = second_content_element.encode_contents().decode('utf-8')
        else:
            print("Second element with class 'content' not found in the extracted link.")
    else:
        print("Element with class 'secondary-link double-arrow-right' not found in the search URL.")
    # Prepare the response to send back to the frontend
    response = {
        'content' : content_html
    }
        
    return jsonify(response)  # Send the response back to the frontend


@app.route('/predict_medicine', methods=['POST'])
def predict_medicine():
    data2 = request.json  # Get JSON data from frontend
    disease = data2.get('disease')  # Get symptoms array from JSON
    # Path to your ChromeDriver executable
    chrome_driver_path = './chromedriver.exe'
    medicine_html = ""
    # Create a WebDriver instance
    service = Service(chrome_driver_path)
    driver = webdriver.Chrome(service=service)

    url = f"https://search.medscape.com/search/?q=%22{disease}%22&plr=ref&contenttype=Drugs+%26+Neutraceuticals&page=1"

    try:
        # Open the URL in the browser
        driver.get(url)

        # Find the divs with class "searchResult"
        div_responsive_tables = driver.find_elements(By.CLASS_NAME, "searchResult")

        if div_responsive_tables:
            # Extract the HTML content of the first 5 divs
            for index, div_responsive_table in enumerate(div_responsive_tables[:6]):
                div_html_content = div_responsive_table.get_attribute('outerHTML')
                medicine_html += div_html_content
                print(f"HTML content of div {index + 1} with class='searchResult':")
                print(div_html_content)
        else:
            print("Divs with class='searchResult' not found")

    except Exception as e:
        print("An error occurred:", e)

    finally:
        # Close the browser
        driver.quit()

    # Prepare the response to send back to the frontend
    response = {
        'medicine' : medicine_html
    }
        
    return jsonify(response)  # Send the response back to the frontend



if __name__ == '__main__':
    app.run(debug=True)
