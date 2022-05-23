from distutils.log import debug
from flask import request, send_file, Flask
from flask_restful import Resource, Api
import pandas as pd

app = Flask(__name__, static_folder='client/build', static_url_path='/')
api = Api(app)

class Locations(Resource):
    # header_list = ['STORE_ID','LATITUDE','LONGITUDE','DAYS_OPEN','ITEM_AVAILABILITY','ZONE', 'BOOKMARKS']
    def get(self):
        data = pd.read_csv('csv_files/new_stores_data.csv')
        data = data.to_json()
        return {'data': data}, 200
        # data = pd.read_csv('csv_files/stores_data.csv')
        # if 'BOOKMARKS' in data.columns:
        #     data = data.to_json()
        #     return {'data': data}, 200
        # else:
        #     data['BOOKMARKS'] = ''
        #     data.to_csv('csv_files/new_stores_data.csv', index=False)
        #     data = data.to_json()
        #     return {'data': data}, 200

api.add_resource(Locations, '/locations', methods=['GET'])

class Bookmark(Resource):
    def put(self):
        bookmark = request.args.get('bookmark')
        store_id = request.args.get('store_id')
        data = pd.read_csv('csv_files/new_stores_data.csv')
        data.loc[data['STORE_ID'].astype(str).str.contains(store_id, na=False) == True, 'BOOKMARKS'] = bookmark
        data.to_csv('csv_files/new_stores_data.csv', index=False)
        data = data.to_json()
        return {'data': data}, 200

api.add_resource(Bookmark, '/bookmark', methods=['PUT'])

class Search(Resource):
    def post(self):
        availability = request.args.get('availability')
        days_open = request.args.get('days_open')
        zone = request.args.get('zone')
        download = request.args.get('download')
        if not availability and not days_open and not zone and download == 'false':
            return 200
        else:
            # data = pd.read_csv('csv_files/stores_data.csv')
            data = pd.read_csv('csv_files/new_stores_data.csv')
            filtered_data = data[
                (data['ITEM_AVAILABILITY'].astype(str).str.contains(availability, na=False)  == True) &
                (data['DAYS_OPEN'].astype(str).str.contains(days_open, na=False)  == True) &
                (data['ZONE'].astype(str).str.contains(str(zone).upper(), na=False)  == True)
            ]
            if download == 'true':
                if not availability and not days_open and not zone:
                    return send_file('csv_files/new_stores_data.csv', mimetype='text/csv', download_name='search_results.csv', as_attachment=True)
                    # return send_file('csv_files/stores_data.csv', mimetype='text/csv', download_name='search_results.csv', as_attachment=True)
                else:
                    filtered_data.to_csv('csv_files/downloads/search_results.csv', index=False)
                    return send_file('csv_files/downloads/search_results.csv', mimetype='text/csv', download_name='search_results.csv', as_attachment=True)
            else:
                if not availability and not days_open and not zone:
                    return 200
                else:
                    filtered_data = filtered_data.to_json()
                    return {'data': filtered_data}, 200

api.add_resource(Search, '/search', methods=['POST'])

if __name__ == '__main__':
    app.run()