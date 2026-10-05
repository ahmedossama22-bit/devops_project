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
                    dockerfiles=$(find . -type f \
                        \( -iname 'Dockerfile' -o -iname 'Dockerfile.*' \) \
                        -not -path './.git/*' \
                        -not -path './frontend/node_modules/*' | sort)

                    if [ -z "$dockerfiles" ]; then
                        echo 'No Dockerfile found; skipping Dockerfile lint.'
                        exit 0
                    fi

                    for dockerfile in $dockerfiles; do
                        echo "Linting $dockerfile"
                        docker run --rm -v "$WORKSPACE:/work" -w /work hadolint/hadolint:latest "$dockerfile"
                    done
                '''
            }
        }

        stage('Lint') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'docker run --rm -v "$PWD:/app" -w /app node:20-alpine sh -c "npm install && npm run lint"'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        sh 'docker run --rm -v "$WORKSPACE/backend:/src" -w /src/ProductApi mcr.microsoft.com/dotnet/sdk:8.0 sh -c "dotnet restore && dotnet format ProductApi.csproj --verify-no-changes --no-restore"'
                    }
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Backend') {
                    steps {
                        sh 'docker compose -p "ci-${BUILD_NUMBER}" build backend'
                    }
                }
                stage('Frontend') {
                    steps {
                        sh 'docker compose -p "ci-${BUILD_NUMBER}" build frontend'
                    }
                }
            }
        }

    }

    post {
        always {
            sh 'docker compose -p "ci-${BUILD_NUMBER}" down --volumes --remove-orphans || true'
            echo "CI pipeline finished: ${currentBuild.currentResult}"
        }
    }
}
