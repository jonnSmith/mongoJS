![mongoJS](https://raw.githubusercontent.com/jonnSmith/mongoJS/master/public/img/logo.png)

# mongoJS - more comfortable, flexible, powerful then RoboMongo and other loosers(*joke)(*not joke later)

It's just a prototype of monogDB manage system. I use many of them (Hi-fife*Robomongo) - and all is pour and uncomfortable. So we can change it. Let's rock!

# Steps for install and start mongoJS server application

* Install [MongoDB](https://docs.mongodb.com/manual/installation/)
```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64,ppc64el,s390x ] http://repo.mongodb.com/apt/ubuntu xenial/mongodb-enterprise/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-enterprise.list
sudo apt-get update
sudo apt-get install -y mongodb-enterprise
systemctl enable mongod.service
sudo service mongod start
```

* Install [Node.js](https://nodejs.org/en/download/package-manager/)
* Go to the app root
* Copy file config.json.dist without .dist extension into app root
* Configure new config.json file according to your needs (mongoDB url on your server, users account, application port, etc)
* Run command from command shell in app root directory
```bash
npm install
```
* After all npm modules successfully installed run command
```bash
npm start
```
* If you need debug log run command
```bash
DEBUG=express:* npm start
```

# Configure

Copy package.json.dist and config.json.dist without .dist extension and configure them for your OS

* impotant - set as dbName and url tail in mongoDB your existing Mongo Database
```bash
i'm fixing that, but for now it's only way, sorry lads
```