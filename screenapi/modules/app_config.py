import dotenv
import os
import logging

"""
Reads .env file into a config dictionary. 
The file is supposed to be present in the "screenapi" directory - which is the root folder and
it has to be named as '.env'
"""
def get_app_config():
    config = {}
    try:
        env_file_name = ".env"
        env_path = dotenv.find_dotenv(filename=env_file_name,raise_error_if_not_found=True, usecwd=True)
        config = dotenv.dotenv_values(env_path)

    except Exception as e:
        logging.error(f"get_app_config: Error reading .env file: {str(e)}")
    return config
