FROM python:3.8

# 컨테이너 내 프로젝트 root directory 설정
WORKDIR /usr/src/app

# 필요한 module 설치
COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# 프로젝트 코드 복사
COPY . .

### 이 아래 command들은 docker-compose에 작성할 내용이므로, 확인 후 삭제한다.
# 포트 설정
EXPOSE 8000
# gunicorn 실행
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "qualla.wsgi:application"]