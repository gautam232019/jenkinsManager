pipeline {
    agent {
        node {
            label 'cje_general_v2'
        }
    }
    parameters {
        string(name: 'REACT_APP_API_TOKEN', description: 'API Token for React app')
        string(name: 'REACT_APP_URL', description: 'URL for React app backend')
    }
    stages {
        stage('Code Pull') {
            steps {
                git branch: 'main', url: 'https://gautam232019:token@github.com/gautam232019/jenkinsManager.git'
            }
        }
        stage('Build and Run Docker') {
            steps {
                script {
                   sh 'docker build -t my-react-app .'
                   sh "docker run -it -d -p 3000:3000 -e REACT_APP_API_TOKEN=${params.REACT_APP_API_TOKEN} -e REACT_APP_URL=${params.REACT_APP_URL} my-react-app"
                }
            }
        }
        stage('')
    }
}
