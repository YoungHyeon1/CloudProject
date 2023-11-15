import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ChatMessages')

def lambda_handler(event, context):
    # event에서 메시지 데이터 추출
    message_id = event['MessageId']
    username = event['Username']
    message_content = event['MessageContent']
    timestamp = int(datetime.now().timestamp())

    # DynamoDB에 데이터 저장
    response = table.put_item(
        Item={
            'MessageId': message_id,
            'Timestamp': timestamp,
            'Username': username,
            'MessageContent': message_content
        }
    )

    return response
