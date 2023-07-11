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
                   sh 'nohup node server.js > server.log 2>&1 &'
                }
            }
        }
        stage('Build and Run Docker') {
            steps {
                script {
                   sh 'docker build -t my-react-app .'
                   sh 'docker run -it -d -p 3000:3000 -e REACT_APP_API_TOKEN=111de7122aadc24bbc3f08d0895b93e8b2 REACT_APP_URL=http://18.236.121.181 my-react-app'
                }
            }
        }
    }
}
