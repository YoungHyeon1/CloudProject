import boto3
from datetime import datetime
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')

def chat_handler(event, context):
    # event에서 메시지 데이터 추출
    try:
        query_str = event['queryStringParameters']
        message_id = query_str['MessageId']
        username =query_str['Username']
        message_content = query_str['MessageContent']
        timestamp = int(datetime.now().timestamp())
    except Exception as e:
        return{
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'message': '잘못된 입력값'})
        }
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(
            {
                'MessageId': message_id,
                'Username': username,
                'Timestamp':timestamp 
                
            }
        )
    }