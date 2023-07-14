from flask import Flask, render_template, request
import csv

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['csvFile']
    if file:
        csv_data = []
        csv_reader = csv.reader(file.read().decode('utf-8').splitlines())
        
        for row in csv_reader:
            csv_data.append(row)

        return render_template('index.html', csv_data=csv_data)

if __name__ == '__main__':
    app.run(debug=True)
