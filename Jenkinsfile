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

        stage('Lint Dockerfile') {
            steps {
                sh '''
                    set -eu
                    dockerfiles=$(find . -type f -iname 'dockerfile*' -not -path './.git/*' -not -path './frontend/node_modules/*' | sort)

                    if [ -z "$dockerfiles" ]; then
                        echo 'No Dockerfile found; skipping Dockerfile lint.'
                        exit 0
                    fi

                    for dockerfile in $dockerfiles; do
                        echo "Linting $dockerfile"
                        docker run --rm --entrypoint /bin/hadolint -v "$WORKSPACE:/work" -w /work hadolint/hadolint:latest "$dockerfile"
                    done
                '''
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

        stage('Push Backend Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {
                    sh '''
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        printf '%s' "$DOCKERHUB_PASSWORD" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        docker tag devops-ci-backend:latest ahmedmohmed/backend_devops:latest
                        docker push ahmedmohmed/backend_devops:latest
                    '''
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {
                    sh '''
                        set -eu
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        printf '%s' "$DOCKERHUB_PASSWORD" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        docker tag devops-ci-frontend:latest ahmedmohmed/frontend_devops:latest
                        docker push ahmedmohmed/frontend_devops:latest
                    '''
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

