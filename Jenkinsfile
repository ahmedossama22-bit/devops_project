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

        stage('SQL Server Integration') {
            steps {
                sh '''
                    set -eu
                    project="ci-${BUILD_NUMBER}"
                    docker compose -p "$project" up -d --wait --wait-timeout 300 sqlserver backend

                    attempt=0
                    while [ "$attempt" -lt 60 ]; do
                        if docker compose -p "$project" exec -T sqlserver \
                            /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa \
                            -P 'YourStrong@Passw0rd' -C -b \
                            -Q "IF DB_ID(N'ProductDb') IS NULL THROW 51000, 'ProductDb was not created', 1; IF OBJECT_ID(N'ProductDb.dbo.Products', N'U') IS NULL THROW 51001, 'Products table was not created', 1; IF NOT EXISTS (SELECT 1 FROM ProductDb.dbo.Products) THROW 51002, 'No products were seeded', 1" \
                            >/dev/null 2>&1; then
                            echo 'SQL Server integration check passed.'
                            exit 0
                        fi
                        attempt=$((attempt + 1))
                        sleep 2
                    done

                    docker compose -p "$project" logs backend
                    exit 1
                '''
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
