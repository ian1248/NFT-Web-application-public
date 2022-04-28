#### Generate Metadata for each Image
import json
# Changes this IMAGES_BASE_URL to yours
IMAGES_BASE_URL = "https://ipfs.io/ipfs/Qma43tF3XeFunBSGaQHGRA5Uqu3fXmD8iRmymSCaAKF1yx/"
PROJECT_NAME = "Point Line Plane"

def getAttribute(key, value):
    return {
        "trait_type": key,
        "value": value
    }
for i in range(4096):
    data ='./data/'+str(i)
    r = open(data, "r")
    data = json.loads(r.read())
    token_id = i
    token = {
        "image": IMAGES_BASE_URL + str(token_id) + '.png',
        "tokenId": token_id,
        "name": PROJECT_NAME + ' ' + str(token_id),
        "attributes":data["attributes"]
    }
    with open('./metadata/' + str(token_id) + ".json", 'w') as outfile:
        json.dump(token, outfile, indent=4)