import boto3


def ivs_status_handler(event, context):
    '''
    Event Bridge에서 방송상태가 변경되면 Dynamodb의 isLive상태를 변경하는 작업입니다.
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('UsersIntegration')

    ivs_status = event["detail"]["event_name"]

    ivs_status_value = "true" if ivs_status == "Stream Start" else "false"

    table.update_item(
        Key={
            'SubKey': event["detail"]["channel_name"]
        },
        UpdateExpression='SET IsLive = :val',
        ExpressionAttributeValues={
            ':val': ivs_status_value
        },
        ReturnValues='UPDATED_NEW'
    )
