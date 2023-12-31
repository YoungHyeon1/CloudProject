import json
import boto3
from datetime import datetime
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
# DynamoDB 리소스 초기화
dynamodb = boto3.resource('dynamodb')


def get_timestamp():
    # 현재 시간을 YYYYMMDDHHMMSS 형식의 숫자로 변환
    return int(datetime.now().strftime("%Y%m%d%H%M%S"))


def send_chat_handler(event, context):
    route_key = event['requestContext']['routeKey']
    connection_id = event['requestContext']['connectionId']
    endpoint = (
        f"https://{event['requestContext']['domainName']}"
        f"/{event['requestContext']['stage']}"
        )
    client = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint)

    if route_key == "$connect":
        return handle_connect(connection_id)
    elif route_key == "$disconnect":
        return handle_disconnect(connection_id)
    else:
        return handle_message(connection_id, event, client)


def handle_connect(connection_id):
    table = dynamodb.Table('UsesrConnection')
    table.put_item(
        Item={
            'MessageId': connection_id
        }
    )
    return {'statusCode': 200, 'body': 'Connected'}


def handle_disconnect(connection_id):
    table = dynamodb.Table('UsesrConnection')
    table.delete_item(
        Key={'MessageId': connection_id}
    )
    return {'statusCode': 200, 'body': 'Disconnected'}


def handle_message(connection_id, event, client):
    # DynamoDB에서 모든 연결 ID를 조회
    connection_table = dynamodb.Table('UsesrConnection')
    response = connection_table.scan()

    # 모든 연결된 사용자에게 메시지 전송
    for item in response['Items']:
        try:
            client.post_to_connection(
                ConnectionId=item['MessageId'],
                Data=json.dumps(json.loads(event['body']))
            )
        except client.exceptions.GoneException as e:
            logger.info(e)
            connection_table.delete_item(
                Key={'MessageId': item['MessageId']}
            )
        except client.exceptions.ClientError as exception_client:
            logger.info(exception_client)
            connection_table.delete_item(
                Key={'MessageId': item['MessageId']}
            )

    table = dynamodb.Table('ChatMessages')
    timestamp = get_timestamp()
    message_data = json.loads(event['body'])
    message_data['MessageId'] = connection_id
    message_data['Timestamp'] = timestamp
    table.put_item(Item=message_data)
