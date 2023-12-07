# CLOUMER

클라우드컴퓨팅 프로젝트입니다.

## 기술스택

- ReactJS (18.2.0)
- Terrafrom (Aws)
- Python3.8

## Getting Started

프로젝트를 로컬에서 실행하기 위해 다음 단계를 따라주세요

```
git clone https://github.com/YoungHyeon1/CloudProject.git
```

##### Frontend 실행

실행하기전 config파일 설정을 완료해야 합니다.

```
cd ./stream-web/web-stream/src
vi config.js
```

```
cd ./stream-web/web-stream
npm install
npm start
```

##### Terrafrom 실행

실행전 [AWS Command Line Interface](https://aws.amazon.com/ko/cli/) 설정을 완료해야 합니다.

```
terrafrom init
terraform plan
terraform apply
```

## Code Lint

- ReactJS는 ESLint 로 포맷팅했습니다.
- Python은 Flake8로 포맷팅 하였습니다.
- Action으로 Lint를 확인 후 머지할 수 있도록 했습니다.

## Deploy

Frontend 는 S3로 cmd로 배포합니다. 나중에 Action에 Main으로 merge 할 경우 자동으로 배포되도록 수정할 예정입니다.

- 배포방법

```
npm build
aws s3 sync ./build s3://[S3 버킷 이름]
```
