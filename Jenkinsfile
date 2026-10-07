pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

//    stages {
 //       stage('Checkout') {
  //          steps {
   //             checkout scm
      //      }
    //    }

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
    }

    post {
        always {
            echo "CI pipeline finished: ${currentBuild.currentResult}"
        }
    }
}
