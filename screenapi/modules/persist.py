import json
import boto3
from datetime import datetime
import uuid
import logging

def save_results_s3(save_result, config):
    try:
        dtmstamp = datetime.utcnow().strftime('%Y%m%d_%H%M%SUTC')
        dtfolder = datetime.utcnow().strftime('%Y%m%d')
        language_code = save_result.get('user_input', {}).get('language_code', "NOLANG")
        age_group = save_result.get('user_input', {}).get('age_group', "NOAGE")
        uuid_str = str(uuid.uuid4()).replace('-','')
        file_name = f"{language_code}_{age_group}_{dtmstamp}_{uuid_str}.json"
        file_prefix = f"{config.get('storage_path')}/{dtfolder}/{file_name}"
        json_string = json.dumps(save_result, indent=4, ensure_ascii=False).encode('UTF-8')

        logging.info(f"Saving file: {file_prefix}: bucket: {config.get('s3bucket')}")

        session = boto3.Session(
            aws_access_key_id=config.get('aws_access_key_id'),
            aws_secret_access_key=config.get('aws_secret_access_key')
        )
        s3 = session.resource('s3')
        s3object = s3.Object(config.get('s3bucket'), file_prefix)
        s3object.put(
            Body=json_string
        )

    except Exception as e:
        logging.error(f"Could not save JSON: {dtmstamp}: {str(e)}")
        return False
    return True


