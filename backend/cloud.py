import jenkins
jenkins_url = 'http://3.21.206.3:8080'
username = 'manas'
password = '11b6b3df5dba37ac687fcdfa48ecded336'

server = jenkins.Jenkins(jenkins_url, username=username, password=password)
print(server)