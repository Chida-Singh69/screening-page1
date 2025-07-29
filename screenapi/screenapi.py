from flask import Flask, request, jsonify, make_response, Response, send_from_directory
import json
from flask_cors import CORS
import os
from modules import eval_survey
from modules import app_config
import dotenv
from modules import persist

config = app_config.get_app_config()

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

#  REMOVE THIS ROUTE when pushing it to render
# @app.route("/")
# def hello():
#     return "<h1 style='color:blue'>API Server for screen app</h1>"

# Fetch and return the right JSON file
@app.route("/survey/<lang_code>/<age_grp>", methods=['GET'])
def get_survey_json(lang_code, age_grp):
    json_txt = None
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, "assets")
    filename = f"survey/{lang_code}/{age_grp}.json"
    full_path = os.path.join(json_path, filename)
    print(f"Retrieving survey questions: {full_path}")
    try:
        assert os.path.isfile(full_path), f"Requested json file {full_path} not found"
        with open(full_path, "r", encoding="utf-8") as fh:
            json_txt = fh.read()
    except AssertionError as ae:
        print(ae)
        return jsonify({"error": str(ae)}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 404

    return Response(json_txt, mimetype='application/json')

# POST survey answers
@app.route("/survey", methods=['POST'])
def eval_survey_answers():
    try:
        data = request.get_json()
        agegroup = data['age_group']
        num_responses = len(data["survey"])
        best_score = num_responses * 1
        worst_score = num_responses * 5
        threshold = worst_score * 0.70

        if agegroup == "age1":
            result = eval_survey.eval_agegroup1(data, threshold)
        elif agegroup == "age2":
            result = eval_survey.eval_agegroup2(data, threshold)
        elif agegroup == "age3":
            result = eval_survey.eval_agegroup3(data, threshold)
        else:
            return jsonify({"error": f"Invalid age group: {agegroup}"}), 400
        
        user_msg = eval_survey.get_eval_message(data, result)
        result["msg"] = user_msg

        save_result = {
            "user_input": data,
            "threshold_score": threshold,
            "result": result
        }
        print(f"Saving to S3: {persist.save_results_s3(save_result, config)}")

        return jsonify(result)
    except KeyError as e:
        print(f"KeyError in survey evaluation: {e}")
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except Exception as e:
        print(f"Error in survey evaluation: {e}")
        return jsonify({"error": "Internal server error during survey evaluation"}), 500

# ✅ Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

