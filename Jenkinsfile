pipeline {
    agent any
    environment {
        BASE_IMAGE = 'm4n/mojofy_backend'
        BACKEND_TAG = 'latest'
        AWS_ECR_LOGIN = true
        COMPOSE_PROJECT_NAME = "back-${env.BRANCH_NAME.replaceAll('_', '-').replaceAll('#', '')}${env.BUILD_NUMBER}"
        DOCKER_MACHINE_NAME = "jt2micro-${env.COMPOSE_PROJECT_NAME}"
    }

    stages {
        stage('Clone repository') {
            steps {
                checkout scm
            }
        }

        stage("Create docker-machine") {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'videonaAWS',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh "docker-machine create -d amazonec2 --amazonec2-access-key ${AWS_ACCESS_KEY_ID} \
                        --amazonec2-secret-key ${AWS_SECRET_ACCESS_KEY} --amazonec2-region us-east-1  \
                        --amazonec2-zone a --amazonec2-vpc-id vpc-bc023cd8 --amazonec2-security-group mojofy-testing \
                        --amazonec2-instance-type t2.micro ${DOCKER_MACHINE_NAME}"
                }

            }
        }


        stage('Test image') {
            steps {
                script {
                    def dockerfile = 'Dockerfile'
                    def testImage = docker.build("backend-test-image:${env.BUILD_ID}", "-f ${dockerfile} ./")
                    def dataStoreSidecar = docker.build("singularities/datastore-emulator")

                    sh "eval \$(docker-machine env --shell bash \$DOCKER_MACHINE_NAME)"
                    sh "docker ps -a"
                    dataStoreSidecar.withRun('-e "DATASTORE_LISTEN_ADDRESS=0.0.0.0:8081" -e "DATASTORE_PROJECT_ID=videona-test"') { c ->
                        testImage.inside("--link ${c.id}:datastore-test -e NODE_ENV=production -e BACKEND_SEARCH_DB=fakelasticsearch -e DATASTORE_EMULATOR_HOST=http://datastore-test:8081 -e BACKEND_API_URL=http://\${DOCKER_MACHINE_IP}:3000") {
                            BACKEND_TAG = sh (
                                script: "node -e \"console.log(require(\'./package.json\').version);\"",
                                returnStdout: true
                                ).trim()
                            //sh "cd /app/src && ../node_modules/gulp/bin/gulp.js build"
                            try {
                                sh "cd /app && node_modules/mocha/bin/mocha --reporter mocha-junit-reporter --reporter-options mochaFile=./src/report/test_results.xml --recursive src/test/"
                            } catch(err) {
                                sh "echo TESTS FAILED"
                                currentBuild.result = 'UNSTABLE'
                                throw err
                            } finally {
                                sh "cp -r /app/src/report ${WORKSPACE}"
                            }
                            sh 'echo "Tests passed"'
                        }
                    }
                }
            }
            post {
                always {
                    junit "report/*.xml"
                    sh "docker rmi backend-test-image:${env.BUILD_ID}"
                    sh "rm -rf report"
                }
            }

        }


        stage('Build image') {
            steps {
                script {
                    def app
                    app = docker.build("${BASE_IMAGE}:${BACKEND_TAG}")
                    echo "backend tag is ${BACKEND_TAG}"
                    echo "Built container image with backend version ${env.BUILD_NUMBER}"
                }
            }
        }


        stage('Push image') {
            when {
                anyOf {
                    branch 'dev'
                    branch 'master'
                }
            }
            steps {
                script {
                    //cleanup current user docker credentials
                    // workarround for https://issues.jenkins-ci.org/browse/JENKINS-44143
                    sh 'rm  ~/.dockercfg || true'
                    sh 'rm ~/.docker/config.json || true'

                    // TODO: generate specific repo for backend?
                    docker.withRegistry("https://891817301160.dkr.ecr.us-east-2.amazonaws.com/m4n/mojofy_frontend", "ecr:us-east-2:m4n-aws") {
                        app.push("build_${env.BUILD_NUMBER}")
                        app.push("${BACKEND_TAG}")
                        app.push("latest")
                    }
                }
            }
        }
    }

    post {
      always {
          sh "docker-machine rm -y ${DOCKER_MACHINE_NAME}"
      }
    }

}
