const inputField = document.getElementById("myInput");
const suggestionList = document.getElementById("suggestionList");
const symptomslist = document.getElementById("symptoms")
const submitButton = document.getElementById("submit")
const disease_name = document.getElementById("disease_name")
const disease_des = document.getElementById("disease_description")
const loader = document.getElementById("loader")
const loader2 = document.getElementById("loader2")
const output = document.getElementById("output")
const medicine = document.getElementById("medicine")
const medicine_des = document.getElementById("medicine_des")
const pre_med = document.getElementById("pre_med")
const suggestions = ["itching", "skin rash", "nodal skin eruptions", "continuous sneezing", "shivering", "chills", "joint pain", "stomach pain", "acidity", "ulcers on tongue", "muscle wasting", "vomiting", "burning micturition", "spotting  urination", "fatigue", "weight gain", "anxiety", "cold hands and feets", "mood swings", "weight loss", "restlessness", "lethargy", "patches in throat", "irregular sugar level", "cough", "high fever", "sunken eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache", "yellowish skin", "dark urine", "nausea", "loss of appetite", "pain behind the eyes", "back pain", "constipation", "abdominal pain", "diarrhoea", "mild fever", "yellow urine", "yellowing of eyes", "acute liver failure", "fluid overload", "swelling of stomach", "swelled lymph nodes", "malaise", "blurred and distorted vision", "phlegm", "throat irritation", "redness of eyes", "sinus pressure", "runny nose", "congestion", "chest pain", "weakness in limbs", "fast heart rate", "pain during bowel movements", "pain in anal region", "bloody stool", "irritation in anus", "neck pain", "dizziness", "cramps", "bruising", "obesity", "swollen legs", "swollen blood vessels", "puffy face and eyes", "enlarged thyroid", "brittle nails", "swollen extremeties", "excessive hunger", "extra marital contacts", "drying and tingling lips", "slurred speech", "knee pain", "hip joint pain", "muscle weakness", "stiff neck", "swelling joints", "movement stiffness", "spinning movements", "loss of balance", "unsteadiness", "weakness of one body side", "loss of smell", "bladder discomfort", "foul smell of urine", "continuous feel of urine", "passage of gases", "internal itching", "toxic look (typhos)", "depression", "irritability", "muscle pain", "altered sensorium", "red spots over body", "belly pain", "abnormal menstruation", "dischromic  patches", "watering from eyes", "increased appetite", "polyuria", "family history", "mucoid sputum", "rusty sputum", "lack of concentration", "visual disturbances", "receiving blood transfusion", "receiving unsterile injections", "coma", "stomach bleeding", "distention of abdomen", "history of alcohol consumption", "fluid overload.1", "blood in sputum", "prominent veins on calf", "palpitations", "painful walking", "pus filled pimples", "blackheads", "scurring", "skin peeling", "silver like dusting", "small dents in nails", "inflammatory nails", "blister", "red sore around nose", "yellow crust ooze"];
var symptoms = []
var index = 0;

inputField.addEventListener("input", function () {
    const inputText = inputField.value.toLowerCase();
    suggestionList.innerHTML = "";

    if (inputText.length === 0) {
        suggestionList.style.display = "none";
        return;
    }

    var matchingSuggestions = suggestions.filter((suggestion) => suggestion.toLowerCase().includes(inputText));
    matchingSuggestions = matchingSuggestions.slice(0, 4)
    if (matchingSuggestions.length === 0) {
        suggestionList.style.display = "none";
        return;
    }

    matchingSuggestions.forEach((suggestion) => {
        const listItem = document.createElement("li");
        listItem.textContent = suggestion;
        suggestionList.appendChild(listItem);

        listItem.addEventListener("click", function () {
            inputField.value = "";
            if (!symptoms.includes(suggestion)) {
                output.classList.add("d-none")
                medicine.classList.add("d-none")
                symptoms.push(suggestion);
                console.log(symptoms);
                let element = document.createElement("div");
                element.classList.add("m-1");
                element.classList.add("d-flex");
                element.classList.add("bg-dark");
                element.classList.add("badge")
                element.classList.add("rounded-pill")
                let content = document.createElement("div");
                content.classList.add("m-1")
                content.innerHTML = suggestion;
                element.appendChild(content)
                let cross = document.createElement("button");
                cross.classList.add("badge")
                cross.classList.add("bg-secondary")
                cross.classList.add("rounded-pill")
                cross.setAttribute("id", `${index}`)
                index = index + 1;
                cross.innerHTML = "X";
                element.appendChild(cross)
                symptomslist.appendChild(element);
                suggestionList.style.display = "none";
            }
        });
    });
    suggestionList.style.display = "block";
});

symptomslist.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
        output.classList.add("d-none")
        medicine.classList.add("d-none")
        let sym = e.target.parentElement.firstChild.innerText;
        console.log(sym);
        symptoms = symptoms.filter(function (letter) {
            return letter !== sym;
        });
        e.target.parentElement.remove();
        e.preventDefault;
    }
})

// Hide the suggestion list when clicking outside of the input and list
document.addEventListener("click", function (event) {
    if (event.target !== inputField && event.target !== suggestionList) {
        suggestionList.style.display = "none";
    }
});

// Prevent form submission when pressing Enter key
inputField.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
    }
});

submitButton.addEventListener("click", function (e) {
    e.preventDefault();
    predictDisease();
});

function predictDisease() {
    output.classList.remove("d-none")
    medicine.classList.add("d-none")
    loader.classList.remove("d-none")
    disease_name.innerText = ""
    medicine_des.innerHTML = ""
    // Construct the JSON payload
    const data = { symptoms: symptoms };

    // Make an HTTP POST request to Flask server
    fetch('http://127.0.0.1:5000/predict_disease', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => {
            // Handle the response data from the backend
            console.log(data.disease);
            disease_name.innerHTML = data.disease
            disease_des.innerHTML = `<h5 id="pre_med" class='text-center text-white'>Getting description for ${data.disease}</h5>`
            disease_description(data.disease)
            predict_medicine(data.disease)
            // Display the predicted diseases on the frontend UI
            // Modify the HTML elements to show the predicted diseases as needed
        })
        .catch(error => console.error('Error:', error));
}

function disease_description(disease) {
    const data3 = { disease: disease };
    fetch('http://127.0.0.1:5000/disease_description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data3),
    })
        .then(response3 => response3.json())
        .then(data3 => {
            // Handle the response data from the backend
            loader.classList.add("d-none")
            disease_des.innerHTML = data3.content
            pre_med.innerText = `Prescribing Medicine for ${disease}`
            medicine_des.innerHTML = ""
            medicine.classList.remove("d-none")
            loader2.classList.remove("d-none")
            // Display the predicted diseases on the frontend UI
            // Modify the HTML elements to show the predicted diseases as needed
        })
        .catch(error => console.error('Error:', error));

}

function predict_medicine(disease) {
    console.log(medicine.classList)
    const data2 = { disease: disease };
    fetch('http://127.0.0.1:5000/predict_medicine', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data2),
    })
        .then(response2 => response2.json())
        .then(data2 => {
            // Handle the response data from the backend
            console.log(data2.medicine);
            loader2.classList.add("d-none")
            medicine.classList.remove("d-none")
            pre_med.innerText = `Prescribed Medicine for ${disease}`
            medicine_des.innerHTML = data2.medicine
            // Display the predicted diseases on the frontend UI
            // Modify the HTML elements to show the predicted diseases as needed
        })
        .catch(error => console.error('Error:', error));

}