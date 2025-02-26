# 우리가 만든 
# FROM: 사용할 도커 이미지 설정
# Nodejs 22.x 버젼 이미지 선택
FROM node:22

# WORKDIR: 이미지내 작업디렉토리 이며, 코드 실행경로를 지정
WORKDIR /usr/src/app

# 패키지 설치를 위해서 package.json, yarn.lock을 복사후 모듈 설치
COPY package.json ./
COPY yarn.lock ./

# RUN: 지정한 명령어 수행
# corepack 활성화 필요
RUN corepack enable

# package.json에 정의한 yarn 버전으로 활성화
RUN corepack prepare yarn@4.5.2 --activate

# yarn 4.5.2 버젼으로 패키지 설치
RUN yarn install

# COPY source(카피 파일경로) dest(카피할 파일 넣은 경로 = WORKDIR)
COPY . .

# 도커에서 서버 애플리케이션 실행시킬때 연결포트 번호를 지정한다.
EXPOSE 3001

# 컨테이너로 서버애플리케이션(개발) 실행시 yarn start:dev 명령어를 수행한다.
CMD ["yarn", "start:dev"]