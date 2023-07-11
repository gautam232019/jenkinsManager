pipeline {
    agent any
    stages {
        stage('Code Pull') {
            steps {
                git branch: 'main', url: 'https://github.com/gautam232019/jenkinsManager.git'
            }
        }
        stage('Start Backend Server') {
            steps {
                script {
                   sh 'cd backend'
                   sh 'nohup node server.js > server.log 2>&1 &'
                   sh 'cd ..'
                }
            }
        }
        stage('Build and Run Docker') {
            steps {
                script {
                   sh 'sudo docker build -t my-react-app .'
                   sh 'sudo docker run -it -d -p 3000:3000 -e REACT_APP_API_TOKEN=1128a16564a510cab9fb48f82225b7da98 REACT_APP_URL=http://18.236.121.181 my-react-app'
                }
            }
        }
    }
}
