pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate Compose') {
            steps {
                sh 'docker compose config --quiet'
            }
        }

        stage('Build Images') {
            parallel {
                stage('Backend') {
                    steps {
                        sh 'docker compose build backend'
                    }
                }
                stage('Frontend') {
                    steps {
                        sh 'docker compose build frontend'
                    }
                }
            }
        }
    }

    post {
        always {
            echo "CI pipeline finished: ${currentBuild.currentResult}"
        }
    }
}

